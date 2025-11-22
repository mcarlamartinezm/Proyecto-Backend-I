import express from 'express';
import productsDao from '../dao/productsDaoMongo.js';


//=========== Variables
const router = express.Router();

// ========= GET obtener todos los productos
  router.get('/', async (req, res) => {
  try {
    // parseo y defaults
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page  = req.query.page  ? parseInt(req.query.page)  : 1;
    // (para ordenar por price)
    const sortQuery = req.query.sort;
    const sort = sortQuery === 'asc' ? 'asc' : sortQuery === 'desc' ? 'desc' : null;

    // query 
    const rawQuery = req.query.query || null;
    let filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    } else if (req.query.status) {
      // permitir que status venga como 'true'/'false' o 'available' etc.
      filter.status = req.query.status;
    } else if (rawQuery) {
      if (rawQuery.includes(':')) {
        const [k, ...rest] = rawQuery.split(':');
        const v = rest.join(':');
        if (k && v) filter[k] = v;
      } else {
        // fallback: intentar usarlo como category o status
        filter.$or = [{ category: rawQuery }, { status: rawQuery }];
      }
    }

    const options = { limit, page, sort, filter };
    const result = await productsDao.getAll(options);

    const base = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const makeLink = (pageNum) => {
      if (!pageNum) return null;
      // crear copia de search params para no mutar la original
      const params = new URLSearchParams(url.searchParams.toString());
      params.set('page', pageNum);
      return `${base}?${params.toString()}`;
    };

    // asegurar que result tiene la forma esperada por la consigna
    // si el DAO ya devuelve prev/next info, usamos esas propiedades; si no, intentamos derivarlas
    const response = {
      status: result.status || 'success',
      payload: result.payload || result.docs || result.products || result, // tolerancia
      totalPages: result.totalPages ?? result.totalPagesCalculated ?? (result.total ? Math.ceil(result.total / limit) : undefined),
      prevPage: result.prevPage ?? (result.page && result.page > 1 ? result.page - 1 : null),
      nextPage: result.nextPage ?? (result.page && result.totalPages && result.page < result.totalPages ? result.page + 1 : null),
      page: result.page ?? page,
      hasPrevPage: result.hasPrevPage ?? (result.page ? result.page > 1 : page > 1),
      hasNextPage: result.hasNextPage ?? (result.totalPages ? (result.page ?? page) < result.totalPages : false),
      prevLink: null,
      nextLink: null
    };

    // asignar prev/next links solo si corresponde
    if (response.hasPrevPage) response.prevLink = makeLink(response.prevPage || (response.page - 1));
    if (response.hasNextPage) response.nextLink = makeLink(response.nextPage || (response.page + 1));

    res.json(response);
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

//=================GET productos por id
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productsDao.getById(pid);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (err) {
    console.error('GET /api/products/:pid error:', err);
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

//========== POST Crear Productos
router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, stock, thumbnail, code, status } = req.body;
    if (!title || !price || !code) {
      return res.status(400).json({ status: 'error', message: 'Faltan campos requeridos: title, price, code' });
    }
    const created = await productsDao.create({ title, description, price, category, stock, thumbnail, code, status });
    // emitir update de productos por socket 
    try {
      const io = req.app.get('io');
      if (io) {
        const all = await productsDao.getAll({ limit: 10, page: 1 });
        io.emit('productsUpdated', all.payload || all);
      }
    } catch (e) { /* no bloquear la respuesta por fallo en io */ }
    res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    console.error('POST /api/products error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

//=========== PUT Actualizar el producto
router.put('/:pid', async (req, res) => {
  try {
    const updated = await productsDao.update(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    try {
      const io = req.app.get('io');
      if (io) {
        const all = await productsDao.getAll({ limit: 10, page: 1 });
        io.emit('productsUpdated', all.payload || all);
      }
    } catch (e) {}
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('PUT /api/products/:pid error:', err);
    res.status(400).json({ status: 'error', message: 'ID inválido o datos inválidos' });
  }
});

//=========== DELETE Eliminar producto
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await productsDao.delete(req.params.pid);
    if (!deleted) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    // emitir update
    try {
      const io = req.app.get('io');
      if (io) {
        const all = await productsDao.getAll({ limit: 10, page: 1 });
        io.emit('productsUpdated', all.payload || all);
      }
    } catch (e) {}
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (err) {
    console.error('DELETE /api/products/:pid error:', err);
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

export default router;

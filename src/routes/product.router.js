import express from 'express';
import productsDaoMongo from '../dao/productsDaoMongo.js';


//=========== Variables
const router = express.Router();

// ========= GET obtener todos los productos
  router.get('/', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const options = { limit, page, sort, query };
    const result = await productsDao.getAll(options);

    const base = `${req.protocol}://${req.get('host')}${req.path}`;
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const search = url.searchParams;

    const makeLink = (pageNum) => {
      if (!pageNum) return null;
      search.set('page', pageNum);
      return `${base}?${search.toString()}`;
    };

    result.prevLink = result.hasPrevPage ? makeLink(result.prevPage) : null;
    result.nextLink = result.hasNextPage ? makeLink(result.nextPage) : null;

    res.json(result);
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

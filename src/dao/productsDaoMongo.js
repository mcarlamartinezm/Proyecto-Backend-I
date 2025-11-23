import ProductsModel from '../models/Products.js';

class ProductsDaoMongo {
    async getAll(options = {}) {
    const limit = parseInt(options.limit) || 10;
    const page = parseInt(options.page) || 1;
    const sortParam = options.sort || null; 
    const filterFromOptions = options.filter || null;
    const queryRaw = options.query || null;

    // construir filtro final
    const filter = {};
    // si viene filter como objeto lo usamos con prioridad
    if (filterFromOptions && typeof filterFromOptions === 'object') {
      // copiar keys relevantes
      if (filterFromOptions.category) filter.category = filterFromOptions.category;
      if (filterFromOptions.status !== undefined) {
        const s = String(filterFromOptions.status).toLowerCase();
        filter.status = (s === 'true' || s === '1' || s === 'available' || s === 'yes');
      }
      if (filterFromOptions.stock !== undefined) {
        const st = filterFromOptions.stock;
        if (typeof st === 'string') {
          if (st.toLowerCase() === 'available') filter.stock = { $gt: 0 };
          else {
            const n = Number(st);
            if (!Number.isNaN(n)) filter.stock = { $eq: n };
          }
        } else if (typeof st === 'number') {
          filter.stock = { $eq: st };
        }
      }
      // permitir pasar otros filtros tal cual
      Object.keys(filterFromOptions).forEach(k => {
        if (!['category', 'status', 'stock'].includes(k)) {
          filter[k] = filterFromOptions[k];
        }
      });
    } else if (queryRaw) {
      // si viene query como string, parsear "key:value" o fallback
      if (typeof queryRaw === 'string') {
        if (queryRaw.includes(':')) {
          const [key, ...rest] = queryRaw.split(':');
          const value = rest.join(':');
          const k = key.trim();
          const v = value.trim();
          if (k === 'category') filter.category = v;
          else if (k === 'status') {
            const s = v.toLowerCase();
            filter.status = (s === 'true' || s === '1' || s === 'available' || s === 'yes');
          } else if (k === 'stock') {
            if (v === 'available' || v.toLowerCase() === 'true') filter.stock = { $gt: 0 };
            else {
              const n = Number(v);
              if (!Number.isNaN(n)) filter.stock = { $eq: n };
            }
          } else {
            // key no explícito para usar como campo directo si existe
            filter[k] = v;
          }
        } else {
          // fallback: intentar category o buscar por título (case-insensitive)
          filter.$or = [
            { category: queryRaw },
            { title: { $regex: queryRaw, $options: 'i' } }
          ];
        }
      }
    }

    let sortObj = {};
    if (sortParam === 'asc') sortObj = { price: 1 };
    else if (sortParam === 'desc') sortObj = { price: -1 };

    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([
      ProductsModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      ProductsModel.countDocuments(filter)
    ]);

    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      status: 'success',
      payload: docs,
      totalDocs,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: null,
      nextLink: null
    };
  }

  async getById(id) {
    return ProductsModel.findById(id).lean();
  }

  async create(productData) {
    const p = await ProductsModel.create(productData);
    return p.toObject();
  }

  async update(id, updateData) {
    return ProductsModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async delete(id) {
    return ProductsModel.findByIdAndDelete(id).lean();
  }
}

export default new ProductsDaoMongo();

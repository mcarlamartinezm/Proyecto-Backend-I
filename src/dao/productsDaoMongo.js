import Product from '../models/Products.js';


class ProductsDaoMongo {
  // algunos opcionales
  async getAll(options = {}, baseUrl = '') {
    const limit = parseInt(options.limit) || 10;
    const page = parseInt(options.page) || 1;
    const sortParam = options.sort || null; 
    const queryRaw = options.query || null;

    // filtro
    const filter = {};
    if (queryRaw) {
      const [key, ...rest] = queryRaw.split(':');
      const value = rest.join(':');
      if (key === 'category') filter.category = value;
      else if (key === 'status') filter.status = (value === 'true' || value === '1');
      else if (key === 'stock') {
        if (value === 'available' || value === 'true') filter.stock = { $gt: 0 };
        else filter.stock = { $eq: Number(value) };
      } else {
        // fallback
        filter.$or = [
          { category: queryRaw },
          { title: { $regex: queryRaw, $options: 'i' } }
        ];
      }
    }

    // sort
    let sortObj = {};
    if (sortParam === 'asc') sortObj = { price: 1 };
    else if (sortParam === 'desc') sortObj = { price: -1 };

    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([
      Products.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Products.countDocuments(filter)
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
    return Products.findById(id).lean();
  }

  async create(productData) {
    const p = await Products.create(productData);
    return p.toObject();
  }

  async update(id, updateData) {
    return Products.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async delete(id) {
    return Products.findByIdAndDelete(id).lean();
  }
}

export default new ProductsDaoMongo();

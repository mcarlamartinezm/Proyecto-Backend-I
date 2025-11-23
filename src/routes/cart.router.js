import express from 'express';
import mongoose from 'mongoose';
import cartsDao from '../dao/cartsDaoMongo.js';

const router = express.Router();

//============== POST Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const cart = await cartsDao.create();
    return res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('POST /api/carts error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

//=============== POST Agregar producto a un carrito
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }

    const updated = await cartsDao.addProduct(cid, pid);

    try {
      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', { cid, cart: updated });
    } catch (e) {}

    return res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('POST /api/carts/:cid/products/:pid error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});


//============== GET Obtener carrito por ID (con populate)
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    if (!mongoose.isValidObjectId(cid)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido: no es un ObjectId de Mongo' });
    }

    const cart = await cartsDao.getById(cid, true);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Cart not found' });

    return res.json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('GET /api/carts/:cid error:', err);
    return res.status(500).json({ status: 'error', message: 'Error interno' });
  }
});


//=============== PUT Reemplazar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const productsArray = req.body;

    if (!mongoose.isValidObjectId(cid)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }

    if (!Array.isArray(productsArray)) {
      return res.status(400).json({ status: 'error', message: 'Body debe ser un arreglo de productos' });
    }

    const updated = await cartsDao.replaceAllProducts(cid, productsArray);
    try {
      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', { cid, cart: updated });
    } catch (e) {}

    return res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('PUT /api/carts/:cid error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

//=========== PUT actualiza cantidad del producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body ?? {};
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }
    if (quantity === undefined) return res.status(400).json({ status: 'error', message: 'quantity required' });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ status: 'error', message: 'quantity debe ser entero > 0' });

    const updated = await cartsDao.updateProductQuantity(cid, pid, qty);
    try {
      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', { cid, cart: updated });
    } catch (e) {}

    return res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('PUT /api/carts/:cid/products/:pid error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

//=============== DELETE Vaciar Carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    if (!mongoose.isValidObjectId(cid)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }

    const updated = await cartsDao.clearCart(cid);
      try {
      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', { cid, cart: updated });
    } catch (e) {}

    return res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('DELETE /api/carts/:cid error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

//=============== DELETE Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }

    const updated = await cartsDao.removeProduct(cid, pid);
    try {
      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', { cid, cart: updated });
    } catch (e) {}

    return res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('DELETE /api/carts/:cid/products/:pid error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;

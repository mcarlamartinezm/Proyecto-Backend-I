import express from 'express';
import cartsDao from '../dao/cartsDaoMongo.js';
import productsDao from '../dao/productsDaoMongo.js';

//============== Variables
const router = express.Router();


//============== POST Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const created = await cartsDao.create();
    res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    console.error('POST /api/carts error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});
//============== GET Lista TODOS los carritos
router.get('/', async (req, res) => {
  try {
    // si quieres listar todos, podrías implementar un find en el DAO; por ahora devolvemos simple
    return res.status(200).json({ status: 'success', message: 'Use GET /api/carts/:cid' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

//============== GET Lista de productos del carrito POR ID
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartsDao.getById(cid, true);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Cart not found' });
    // devolver solo los productos del carrito (payload)
    return res.json({ status: 'success', payload: cart.products });
  } catch (err) {
    console.error('GET /api/carts/:cid error:', err);
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

//=============POST POR ID Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    let { quantity } = req.body ?? {};
    if (quantity === undefined) quantity = 1;
    quantity = Number(quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ status: 'error', message: 'quantity debe ser entero > 0' });

    // validar producto existe en BD
    const product = await productsDao.getById(pid);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no existe' });

    const updated = await cartsDao.addProduct(cid, pid, quantity);
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('POST /api/carts/:cid/product/:pid error:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
});

//===========PUT actualiza cantidad del producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body ?? {};
    if (quantity === undefined) return res.status(400).json({ status: 'error', message: 'quantity required' });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ status: 'error', message: 'quantity debe ser entero > 0' });

    const updated = await cartsDao.updateProductQuantity(cid, pid, qty);
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('PUT /api/carts/:cid/products/:pid error:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
});

//===============DELETE Eliminar carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updated = await cartsDao.removeProduct(cid, pid);
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('DELETE /api/carts/:cid/products/:pid error:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
});

//===============DELETE Vaciar Carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const updated = await cartsDao.clearCart(cid);
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    console.error('DELETE /api/carts/:cid error:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
});



export default router;

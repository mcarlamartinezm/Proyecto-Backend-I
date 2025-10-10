import express from 'express';
import CartManager from '../managers/CartManager.js';
import ProductManager from '../managers/ProductManager.js';

//============== Variables
const router = express.Router();
const cm = new CartManager('./data/carts.json');
const pm = new ProductManager('./data/products.json');

//============== Crear un nuevo carrito
router.post('/', async (req, res) => {
  const newCart = await cm.createCart();
  res.status(201).json(newCart);
});

//============== Lista de productos del carrito
router.get('/:cid', async (req, res) => {
  const cart = await cm.getCartById(Number(req.params.cid));
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
});

//============= Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  const product = await pm.getProductById(Number(pid));
  if (!product) return res.status(404).json({ error: 'Producto no existe' });

  const updatedCart = await cm.addProductToCart(Number(cid), Number(pid));
  if (!updatedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(updatedCart);
});

export default router;

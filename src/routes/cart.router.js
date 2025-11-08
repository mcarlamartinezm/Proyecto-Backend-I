import express from 'express';
import CartManager from '../manager/cartManager.js';
import ProductManager from '../manager/productManager.js';

//============== Variables
const router = express.Router();
const cm = new CartManager('./data/carts.json');
const pm = new ProductManager('./data/products.json');

//============== Crear un nuevo carrito
router.post('/', async (req, res) => {
  const newCart = await cm.createCart();
  res.status(201).json(newCart);
});

//============== Lista TODOS los carritos
router.get('/', async (req, res) => {
  const carts = await cm.getCarts();
  res.json(carts);
});

//============== Lista de productos del carrito POR ID
router.get('/:cid', async (req, res) => {
  //================ Validar que cid sea número
  const cid = Number(req.params.cid);
  if (Number.isNaN(cid)) {
    return res.status(400).json({ error: 'cid debe ser un número' });
  }

  //================ Buscar carrito
  const cart = await cm.getCartById(cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

  res.json(cart.products);
});

//============= Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const cid = Number(req.params.cid);
  const pid = Number(req.params.pid);
  //================ Validar tipos
  if (Number.isNaN(cid) || Number.isNaN(pid)) {
    return res.status(400).json({ error: 'cid y pid deben ser números' });
  }

  //================ Validar producto existe
  const product = await pm.getProductById(pid);
  if (!product) return res.status(404).json({ error: 'Producto no existe' });

  //================ permitir cantidad en body
  let { quantity } = req.body || {};
  if (quantity === undefined) quantity = 1;
  quantity = Number(quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'quantity debe ser un entero > 0' });
  }

  //================ Agregar al carrito
  const updatedCart = await cm.addProductToCart(cid, pid, quantity);
  if (!updatedCart) return res.status(404).json({ error: 'Carrito no encontrado' });

  res.json(updatedCart);
});

export default router;

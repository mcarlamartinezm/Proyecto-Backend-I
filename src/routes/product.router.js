import express from 'express';
import ProductManager from '../manager/productManager.js';

//=========== Variables
const router = express.Router();
const pm = new ProductManager('./data/products.json');

//========== Listar todos los productos
router.get('/', async (req, res) => {
  const products = await pm.getProducts();
  res.json(products);
});

// ========= Obtener producto por id
router.get('/:pid', async (req, res) => {
  const product = await pm.getProductById(Number(req.params.pid));
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

//========== Crear un nuevo producto
router.post('/', async (req, res) => {
  const {  title, description, price, category, stock, thumbnail, code, status } = req.body;
  if (!title || !description || !price || !category || !stock || !thumbnail || !code ||!status){
    return res.status(400).json ({ error: "faltan campos obligatorios por llenar"});
  }
  const newProduct = await pm.addProduct(req.body);
  res.status(201).json(newProduct);
  //io
  const io = req.app.get("io");
  const products = await pm.getProducts();
  io.emit("productsUpdated", products);
});

//=========== Actualizar producto por id
router.put('/:pid', async (req, res) => {
  const updated = await pm.productsUpdated(Number(req.params.pid), req.body);
  if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updated);
  //io
  const io = req.app.get("io");
  const products = await pm.getProducts();
  io.emit("productsUpdated", products);
});

//=========== Eliminar producto por id
router.delete('/:pid', async (req, res) => {
  const deleted = await pm.deleteProduct(Number(req.params.pid));
  if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ success: true });
  //io
  const io = req.app.get("io");
  const products = await pm.getProducts();
  io.emit("productsUpdated", products);
});

export default router;

import express from 'express';
import ProductManager from '../managers/ProductManager.js';

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
  const newProduct = await pm.addProduct(req.body);
  res.status(201).json(newProduct);
});

//=========== Actualizar producto por id
router.put('/:pid', async (req, res) => {
  const updated = await pm.updateProduct(Number(req.params.pid), req.body);
  if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updated);
});

//=========== Eliminar producto por id
router.delete('/:pid', async (req, res) => {
  const deleted = await pm.deleteProduct(Number(req.params.pid));
  if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ success: true });
});

export default router;

import express from 'express';
import productRouter from './src/routes/product.router.js';
import cartRouter from './src/routes/cart.router.js';

//=============Variables

const app = express();
const PORT = 8080;

//============ Middleware para parsear JSON
app.use(express.json());

//============ Ruteo principal
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

//============ Ruta para errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

//============ Levanta servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

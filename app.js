import express from 'express';
import productRouter from './src/routes/product.router.js';
import cartRouter from './src/routes/cart.router.js';
import viewsRouter from './src/routes/views.router.js';
//handlebars importaciones
import path from "path";
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
//socket.io importaciones
import http from "http";
import { Server } from "socket.io";
//mongoDB importaciones
import connectMongoDB from './src/config/mongo.js';
import 'dotenv/config';


//=============Variables

const app = express();
const PORT = process.env.PORT ?? 8080;

//variables de handlebars
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
//variables de socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer);

//============ Middleware 

app.use(express.json());
app.use("/public", express.static(path.join(_dirname, "src", "public")));
app.use(express.urlencoded({ extended: true }));


//============ Ruteo principal
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
//Ruteo views
app.use("/", viewsRouter);


//============ Ruta para errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});


//============handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(_dirname, "src","views"));
//socket.io
app.set("io", io);



//============ Levanta servidor
connectMongoDB();

//para ver la web mientras edito
httpServer.listen(PORT, () => { 
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

import { Router } from "express";
import productsDao from "../dao/productsDaoMongo.js";

const router = Router();

//=================Home: lista de productos 
router.get("/", async (req, res) => {
  try {
    const result = await productsDao.getAll({ limit: 100, page: 1 });
    const products = Array.isArray(result) ? result : (result.payload ?? result.docs ?? []);
    res.render("home", { products });
  } catch (err) {
    console.error("Error al renderizar home:", err);
    res.status(500).send("Error interno");
  }
});

//================vista RealTime 
router.get("/realtimeproducts", async (req, res) => {
  try {
    const result = await productsDao.getAll({ limit: 100, page: 1 });
    const products = Array.isArray(result) ? result : (result.payload ?? result.docs ?? []);
    res.render("realTimeProducts", { products });
  } catch (err) {
    console.error("Error al renderizar realtimeproducts:", err);
    res.status(500).send("Error interno");
  }
});

//=================vista a carts
router.get("/carts", async (req, res) => {
  res.render("carts");
});

export default router;

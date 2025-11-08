import { Router } from "express";
import ProductManager from "../manager/productManager.js";
import CartManager from "../manager/cartManager.js";

//============== instancias
const router = Router();
const pm = new ProductManager("./data/products.json");
const cm = new CartManager ("./data/carts.json")

//=================Home: lista de productos
router.get("/", async (req, res)=>{
    const products = await pm.getProducts();
    res.render("home", { products });
});


//================vista RealTime
router.get("/realtimeproducts", async (req, res)=>{
    const products = await pm.getProducts();
    res.render("realTimeProducts", { products });
});

//=================vista a carts
router.get("/carts", async (req, res) => {
  res.render("carts");
});

export default router;
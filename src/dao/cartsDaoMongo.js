import CartsModel from '../models/Carts.js';
import ProductsModel from '../models/Products.js';
import mongoose from 'mongoose';

class CartsDaoMongo {
  async create() {
    const cart = await CartsModel.create({});
    return cart.toObject();
  }

  async getById(cid, populate = false) {
    if (populate) {
      return CartsModel.findById(cid).populate('products.product').lean();
    }
    return CartsModel.findById(cid).lean();
  }

  async addProduct(cid, pid, quantity = 1) {
    // validar que el producto exista
    const prodExists = await ProductsModel.findById(pid).lean();
    if (!prodExists) throw new Error('Producto no encontrado');

    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const item = cart.products.find(p => p.product.toString() === pid.toString());
    if (item) {
      item.quantity = item.quantity + quantity;
    } else {
      cart.products.push({ product: mongoose.Types.ObjectId(pid), quantity });
    }
    await cart.save();
    return cart.toObject();
  }

  async removeProduct(cid, pid) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');
    cart.products = cart.products.filter(p => p.product.toString() !== pid.toString());
    await cart.save();
    return cart.toObject();
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (quantity < 1) throw new Error('Quantity must be >= 1');
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');
    const item = cart.products.find(p => p.product.toString() === pid.toString());
    if (!item) throw new Error('Producto no está en el carrito');
    item.quantity = quantity;
    await cart.save();
    return cart.toObject();
  }

  async clearCart(cid) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');
    cart.products = [];
    await cart.save();
    return cart.toObject();
  }

  // Reemplaza todos los productos del carrito con el arreglo pasado:
  // productsArray = [{ product: pid, quantity: n }, ...]
  async replaceAllProducts(cid, productsArray) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    if (!Array.isArray(productsArray)) {
      throw new Error('productsArray debe ser un arreglo');
    }

    // validar y transformar cada item
    const newProducts = [];
    for (const item of productsArray) {
      if (!item || !item.product) throw new Error('Cada item debe tener { product, quantity }');
      const qty = item.quantity === undefined ? 1 : Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) throw new Error('quantity debe ser entero > 0 en cada item');

      // validar que el producto exista
      const prod = await ProductsModel.findById(item.product).lean();
      if (!prod) throw new Error(`Producto no encontrado: ${item.product}`);

      newProducts.push({
        product: mongoose.Types.ObjectId(item.product),
        quantity: qty
      });
    }

    cart.products = newProducts;
    await cart.save();
    return cart.toObject();
  }
}

export default new CartsDaoMongo();

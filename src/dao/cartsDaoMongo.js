import Carts from '../models/Carts.js';
import Products from '../models/Products.js';
import mongoose from 'mongoose';

class CartsDaoMongo {
  async create() {
    const Carts = await Cart.create({});
    return Carts.toObject();
  }

  async getById(cid, populate = false) {
    if (populate) {
      return Carts.findById(cid).populate('products.product').lean();
    }
    return Carts.findById(cid).lean();
  }

  async addProduct(cid, pid, quantity = 1) {
    const Carts = await Carts.findById(cid);
    if (!Carts) throw new Error('Carrito no encontrado');

    const item = Carts.Products.find(p => p.Products.toString() === pid.toString());
    if (item) {
      item.quantity = item.quantity + quantity;
    } else {
      Carts.Products.push({ Products: mongoose.Types.ObjectId(pid), quantity });
    }
    await Carts.save();
    return Carts.toObject();
  }

  async removeProduct(cid, pid) {
    const Carts = await Carts.findById(cid);
    if (!Carts) throw new Error('Carrito no encontrado');
    Carts.Products = Carts.Products.filter(p => p.Products.toString() !== pid.toString());
    await Carts.save();
    return Carts.toObject();
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (quantity < 1) throw new Error('Quantity must be >= 1');
    const Carts = await Carts.findById(cid);
    if (!Carts) throw new Error('Carrito no encontrado');
    const item = Carts.products.find(p => p.Products.toString() === pid.toString());
    if (!item) throw new Error('Producto no está en el carrito');
    item.quantity = quantity;
    await Carts.save();
    return Carts.toObject();
  }

  async clearCart(cid) {
    const Carts = await Carts.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');
    Carts.Products = [];
    await Carts.save();
    return Carts.toObject();
  }
}

export default new CartsDaoMongo();

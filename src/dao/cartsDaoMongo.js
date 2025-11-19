import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

class CartsDaoMongo {
  async create() {
    const cart = await Cart.create({});
    return cart.toObject();
  }

  async getById(cid, populate = false) {
    if (populate) {
      return Cart.findById(cid).populate('products.product').lean();
    }
    return Cart.findById(cid).lean();
  }

  async addProduct(cid, pid, quantity = 1) {
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Cart not found');

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
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Cart not found');
    cart.products = cart.products.filter(p => p.product.toString() !== pid.toString());
    await cart.save();
    return cart.toObject();
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (quantity < 1) throw new Error('Quantity must be >= 1');
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Cart not found');
    const item = cart.products.find(p => p.product.toString() === pid.toString());
    if (!item) throw new Error('Product not in cart');
    item.quantity = quantity;
    await cart.save();
    return cart.toObject();
  }

  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Cart not found');
    cart.products = [];
    await cart.save();
    return cart.toObject();
  }
}

export default new CartsDaoMongo();

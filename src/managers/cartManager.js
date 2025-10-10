import fs from 'fs';

//================ Definir clase Carrito
export default class CartManager {
  constructor(path) {
    this.path = path;
  }

//============= Devuelve los carritos
  async getCarts() {
    if (!fs.existsSync(this.path)) return [];
    const data = await fs.promises.readFile(this.path, 'utf-8');
    return JSON.parse(data);
  }

//============= Crear nuevo carrito con ID autogenerado
  async createCart() {
    const carts = await this.getCarts();
    const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id: newId, products: [] };
    carts.push(newCart);

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

//================ Obtener carrito con ID
  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === id);
  }

//================ Agregar producto al carrito
  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    const existing = cart.products.find(p => p.product === pid);
    if (existing) {
      existing.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

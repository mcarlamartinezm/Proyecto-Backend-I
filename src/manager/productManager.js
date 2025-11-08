import fs from 'fs';

//==================Definir clase Productos
export default class ProductManager {
  constructor(path) {
    this.path = path;
  }

  // ================= Leer archivo
  async getProducts() {
    if (!fs.existsSync(this.path)) return [];
    const data = await fs.promises.readFile(this.path, 'utf-8');
    return JSON.parse(data);
  }

  // ================ Agregar producto con ID autogenerado
  async addProduct(product) {
    const products = await this.getProducts();

    //=============== Generar ID basado en el último elemento
    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    //=============== Producto con TODOS los campos controlados
    const newProduct = {
      id: newId,
      title: product.title,
      description: product.description,
      price: product.price,
      thumbnail: product.thumbnail,
      code: product.code,
      stock: product.stock,
      category: product.category,
      status: product.status ?? true  // default si no viene
    };

    products.push(newProduct);

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));

    return newProduct;
  }

  // ================ Obtener producto por ID
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  // ================ Actualizar producto por ID
  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updatedFields, id: products[index].id };
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
  }

  // ================ Eliminar producto por ID
  async deleteProduct(id) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products.splice(index, 1);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return true;
  }
}

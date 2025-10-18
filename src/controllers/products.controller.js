const db = require('../models');
const Product = db.Product;

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const newProduct = await Product.create({ name, price, description });
    res.status(201).json({ message: 'Producto creado con éxito', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// Actualizar un producto por ID
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.update({ name, price, description });
    res.status(200).json({ message: 'Producto actualizado con éxito', product });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.destroy();
    res.status(200).json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

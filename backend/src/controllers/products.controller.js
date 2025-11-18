// src/controllers/products.controllers.js (CÓDIGO ARREGLADO)

import { 
    getAllProductsDB,
    getProductByIdDB,
    createProductDB,
    updateProductDB,
    deleteProductDB
} from "../models/produts.model.js"; // <--- ¡Asegúrate de que el .js está aquí!

export const getAllProducts = async (req, res) => {
    // Manejo de errores básico para el GET general
    try {
        const products = await getAllProductsDB();
        res.json(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener productos." });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdDB(req.params.id);
        if (product.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
        res.json(product[0]);
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.id}:`, error);
        res.status(500).json({ msg: "Error interno del servidor." });
    }
};

export const createProduct = async (req, res) => {
    try {
        const result = await createProductDB(req.body);
        // Usar 201 Created para una creación exitosa
        res.status(201).json({ msg: "Producto creado exitosamente", result }); 
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ msg: "Error interno del servidor al crear producto." });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const result = await updateProductDB(req.body, req.params.id);
        // Verificar si se afectó alguna fila para confirmar la actualización
        if (result.affectedRows === 0) return res.status(404).json({ msg: "Producto no encontrado para actualizar" });
        res.json({ msg: "Producto actualizado", result });
    } catch (error) {
        console.error(`Error al actualizar producto ${req.params.id}:`, error);
        res.status(500).json({ msg: "Error interno del servidor al actualizar." });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const result = await deleteProductDB(req.params.id);
        // Verificar si se afectó alguna fila para confirmar la eliminación
        if (result.affectedRows === 0) return res.status(404).json({ msg: "Producto no encontrado para eliminar" });
        res.json({ msg: "Producto eliminado", result });
    } catch (error) {
        console.error(`Error al eliminar producto ${req.params.id}:`, error);
        res.status(500).json({ msg: "Error interno del servidor al eliminar." });
    }
};
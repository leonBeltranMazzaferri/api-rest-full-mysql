import { 
    // Importamos las funciones del MODELO (las que interactúan con la DB)
    getAllProductoDB,
    getProductoByIdDB,
    createProductoDB,
    updateProductoDB,
    deleteProductoDB
} from "../models/producto.model.js"; // 🚨 CORRECCIÓN 2: Apunta al modelo renombrado

// -----------------------------------------------------------
// FUNCIONES DEL CONTROLADOR (Manejan req, res y llaman al MODELO)
// -----------------------------------------------------------

// 🚨 CORRECCIÓN 3: Renombramos a getAllProducto (sin 's' y sin 'DB')
export const getAllProducto = async (req, res) => {
    try {
        // Llama a la función del MODELO importada
        const producto = await getAllProductoDB();
        res.json(producto);
    } catch (error) {
        // Imprime el error de la DB en la terminal y devuelve un 500 al cliente
        console.error("❌ Error al obtener productos:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener productos." });
    }
};

// 🚨 CORRECCIÓN 4: Renombramos a getProductoById
export const getProductoById = async (req, res) => {
    try {
        const producto = await getProductoByIdDB(req.params.id);
        if (producto.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
        res.json(producto[0]);
    } catch (error) {
        console.error(`❌ Error al obtener producto ${req.params.id}:`, error);
        res.status(500).json({ msg: "Error interno del servidor." });
    }
};

// 🚨 CORRECCIÓN 5: Renombramos a createProducto
export const createProducto = async (req, res) => {
    try {
        const result = await createProductoDB(req.body);
        res.status(201).json({ msg: "Producto creado exitosamente", result }); 
    } catch (error) {
        console.error("❌ Error al crear producto:", error);
        res.status(500).json({ msg: "Error interno del servidor al crear producto." });
    }
};


export const updateProducto = async (req, res) => {
    try {
        const result = await updateProductoDB(req.body, req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ msg: "Producto no encontrado para actualizar" });
        res.json({ msg: "Producto actualizado", result });
    } catch (error) {
        console.error(`❌ Error al actualizar producto ${req.params.id}:`, error);
        res.status(500).json({ msg: "Error interno del servidor al actualizar." });
    }
};


export const deleteProducto = async (req, res) => {
    try {
        const result = await deleteProductoDB(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ msg: "Producto no encontrado para eliminar" });
        res.json({ msg: "Producto eliminado", result });
    } catch (error) {
        console.error(`❌ Error al eliminar producto ${req.params.id}:`, error);
        res.status(500).json({ msg: "Error interno del servidor al eliminar." });
    }
};
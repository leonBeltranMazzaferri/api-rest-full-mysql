import pool from "../../config/conexion.js";

// Renombrar todas las funciones a 'ProductoDB'
export const getAllProductoDB = async () => {
    // 🚨 CORRECCIÓN 1: Usamos la tabla 'producto' (singular)
    const [rows] = await pool.query("SELECT * FROM producto"); 
    return rows;
};

export const getProductoByIdDB = async (id) => {
    // 🟢 CORRECCIÓN CLAVE: Cambiado 'id' a 'id_producto' en la cláusula WHERE
    const [rows] = await pool.query("SELECT * FROM producto WHERE id_producto = ?", [id]); 
    return rows;
};

export const createProductoDB = async (data) => {
    const [result] = await pool.query("INSERT INTO producto SET ?", data); 
    return result;
};

export const updateProductoDB = async (data, id) => {
    // 🟢 CORRECCIÓN CLAVE: Cambiado 'id' a 'id_producto' en la cláusula WHERE
    const [result] = await pool.query("UPDATE producto SET ? WHERE id_producto = ?", [data, id]); 
    return result;
};

export const deleteProductoDB = async (id) => {
    // 🟢 CORRECCIÓN CLAVE: Cambiado 'id' a 'id_producto' en la cláusula WHERE
    const [result] = await pool.query("DELETE FROM producto WHERE id_producto = ?", [id]); 
    return result;
};
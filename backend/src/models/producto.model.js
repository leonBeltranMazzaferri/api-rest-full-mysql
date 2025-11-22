import pool from "../../config/conexion.js";

// Renombrar todas las funciones a 'ProductoDB'
export const getAllProductoDB = async () => {
    // 🚨 CORRECCIÓN 1: Usamos la tabla 'producto' (singular)
    const [rows] = await pool.query("SELECT * FROM producto"); 
    return rows;
};

export const getProductoByIdDB = async (id) => {
    const [rows] = await pool.query("SELECT * FROM producto WHERE id = ?", [id]); 
    return rows;
};

export const createProductoDB = async (data) => {
    const [result] = await pool.query("INSERT INTO producto SET ?", data); 
    return result;
};

export const updateProductoDB = async (data, id) => {
    const [result] = await pool.query("UPDATE producto SET ? WHERE id = ?", [data, id]); 
    return result;
};

export const deleteProductoDB = async (id) => {
    const [result] = await pool.query("DELETE FROM producto WHERE id = ?", [id]); 
    return result;
};
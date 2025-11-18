import pool from "../../config/conexion.js";

export const getAllProductsDB = async () => {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
};

export const getProductByIdDB = async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows;
};

export const createProductDB = async (data) => {
    const [result] = await pool.query("INSERT INTO products SET ?", data);
    return result;
};

export const updateProductDB = async (data, id) => {
    const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [data, id]);
    return result;
};

export const deleteProductDB = async (id) => {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return result;
};

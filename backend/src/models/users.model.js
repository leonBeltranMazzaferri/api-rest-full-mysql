// src/models/users.model.js

import pool from "../../config/conexion.js"; // Asegúrate de que esta ruta sea correcta
import bcrypt from "bcrypt";
import "dotenv/config"; // Para usar process.env.SALT_ROUNDS, etc.

// --- Helpers para la autenticación ---

/**
 * Genera un hash seguro para la contraseña del usuario.
 */
const hashPassword = async (password) => {
    // Usamos el salt por defecto (10 rondas) o el configurado en .env
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
    return bcrypt.hash(password, salt);
};

/**
 * Compara la contraseña ingresada con el hash almacenado.
 */
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};


// ----------------------------------------
// FUNCIONES DE REGISTRO Y BÚSQUEDA (Usadas por el Controlador)
// ----------------------------------------

// RENOMBRADO: Antes era 'createUser', ahora es 'registerUserDB'
export const registerUserDB = async ({ nombre, email, password }) => {
    try {
        // 1. Hashear la contraseña antes de guardarla (SEGURIDAD)
        const hashedPassword = await hashPassword(password);
        
        // 2. Insertar el usuario
        const [result] = await pool.query(
            "INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)",
            [nombre, email, hashedPassword]
        );
        return result;
    } catch (error) {
        // Lanza el error (ej: si el email ya existe)
        throw error; 
    }
};

// RENOMBRADO: Antes era 'getUserByEmail', ahora es 'getUserByEmailDB'
export const getUserByEmailDB = async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (rows.length === 0) return null;

    // Retornamos los datos del usuario y la función para comparar la contraseña
    return {
        ...rows[0],
        comparePassword: (password) => comparePassword(password, rows[0].password)
    };
};

// RENOMBRADO: Antes era 'getUserById', ahora es 'getUserByIdDB'
export const getUserByIdDB = async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id_user = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
};


// ----------------------------------------
// FUNCIONES CRUD RESTANTES (Si las necesitas en otro controlador)
// ----------------------------------------

export const getAllUser = async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

export const updateUser = async (data, id) => {
    const [result] = await pool.query("UPDATE users SET ? WHERE id_user = ?", [data, id]);
    return result;
};

export const deleteUser = async (id) => {
    const [result] = await pool.query("DELETE FROM users WHERE id_user = ?", [id]);
    return result;
};
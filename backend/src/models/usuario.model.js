// src/models/usuario.model.js

import pool from "../../config/conexion.js"; // Asegúrate de que esta ruta sea correcta
import bcrypt from "bcrypt";
import "dotenv/config"; 

// --- Helpers para la autenticación ---

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};


// ----------------------------------------
// FUNCIONES DEL MODELO PARA EL CONTROLADOR
// ----------------------------------------

export const registerUserDB = async ({ nombre, email, password }) => {
    try {
        const hashedPassword = await hashPassword(password);
        
        // 1. Inserción en la tabla 'usuario'
        const [result] = await pool.query(
            "INSERT INTO usuario (nombre, email, password) VALUES (?, ?, ?)",
            [nombre, email, hashedPassword]
        );
        return result;
    } catch (error) {
        throw error; // Permite que el controlador maneje ER_DUP_ENTRY
    }
};

export const getUserByEmailDB = async (email) => {
    // 2. Búsqueda por Email en la tabla 'usuario'
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    
    if (rows.length === 0) return null;

    const user = rows[0];

    // Mapeamos el ID y adjuntamos la función de comparación de contraseña
    return {
        ...user,
        // Usamos id_usuario como nombre de columna principal para el ID
        id: user.id_usuario || user.id_user, 
        comparePassword: (password) => comparePassword(password, user.password)
    };
};

export const getUserByIdDB = async (id) => {
    // 3. Búsqueda por ID en la tabla 'usuario' usando 'id_usuario'
    const [rows] = await pool.query("SELECT * FROM usuario WHERE id_usuario = ?", [id]);
    
    const user = rows.length > 0 ? rows[0] : null;
    
    if (user) {
        // Aseguramos que el controlador reciba 'id' para consistencia
        user.id = user.id_usuario || user.id_user;
    }
    return user;
};


// ----------------------------------------
// FUNCIONES CRUD RESTANTES
// ----------------------------------------

export const getAllUser = async () => {
    const [rows] = await pool.query("SELECT * FROM usuario");
    return rows;
};

export const updateUser = async (data, id) => {
    // Actualización usando 'id_usuario'
    const [result] = await pool.query("UPDATE usuario SET ? WHERE id_usuario = ?", [data, id]);
    return result;
};

export const deleteUser = async (id) => {
    // Eliminación usando 'id_usuario'
    const [result] = await pool.query("DELETE FROM usuario WHERE id_usuario = ?", [id]);
    return result;
};
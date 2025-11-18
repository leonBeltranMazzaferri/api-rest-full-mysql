// src/controllers/users.controllers.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
    // Usamos las funciones del modelo que te proporcioné antes:
    registerUserDB, 
    getUserByEmailDB,
    getUserByIdDB
} from "../models/users.model.js";
import "dotenv/config";

// Asegúrate de que tu modelo users.model.js exporte solo las funciones que necesitas
// y que hayas instalado 'jsonwebtoken' (npm install jsonwebtoken).


// --- Helper para generar el token JWT ---
const generateToken = (id, email) => {
    // Usamos la variable de entorno JWT_SECRET (de tu .env)
    return jwt.sign({ id, email }, process.env.JWT_SECRET, {
        expiresIn: "1d", // Expira en 1 día, puedes cambiarlo (el frontend lo usaba en '1d')
    });
};

// ----------------------------------------
// 1. REGISTRO (SIGN UP)
// ----------------------------------------
export const register = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ msg: "Faltan campos obligatorios." });
    }

    try {
        // En el modelo, ya manejamos el hashing y la verificación de existencia
        const result = await registerUserDB({ nombre, email, password });

        // Si el registro es exitoso, generamos el token y lo enviamos en una cookie
        if (result.insertId) {
            const token = generateToken(result.insertId, email);

            res.cookie('access_token', token, {
                httpOnly: true, // Seguridad: no accesible por JS del lado del cliente
                secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
                maxAge: 24 * 60 * 60 * 1000, // 1 día
            });

            return res.status(201).json({ 
                msg: "Usuario registrado con éxito e inicio de sesión automático", 
                id: result.insertId 
            });
        }

    } catch (error) {
        // Error de email duplicado (si el modelo lo lanza)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ msg: "El email ya está registrado." });
        }
        console.error("Error al registrar:", error);
        return res.status(500).json({ msg: "Error interno del servidor." });
    }
};


// ----------------------------------------
// 2. LOGIN (SIGN IN)
// ----------------------------------------
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Faltan credenciales." });
    }

    try {
        // getUserByEmailDB devuelve un objeto con la función comparePassword si existe
        const user = await getUserByEmailDB(email);

        // 1. Verificar si el usuario existe y si la contraseña es correcta
        if (user && (await user.comparePassword(password))) {
            
            const token = generateToken(user.id_user, user.email);

            // 2. Establecer la cookie (CRUCIAL para la ruta protegida)
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000,
            });

            // 3. Responder con éxito
            return res.json({ msg: "Inicio de sesión exitoso", nombre: user.nombre });

        } else {
            return res.status(401).json({ msg: "Credenciales inválidas (email o contraseña incorrectos)." });
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ msg: "Error interno del servidor." });
    }
};

// ----------------------------------------
// 3. RUTA PROTEGIDA (showAccount / Profile)
// ----------------------------------------
export const showAccount = async (req, res) => {
    // req.user viene del middleware 'protect' (que ya verificó el token)
    try {
        const user = await getUserByIdDB(req.user.id); 

        if (!user) {
            return res.status(404).json({ msg: "Usuario autenticado no encontrado en DB." });
        }
        
        // Retornamos los datos del usuario (sin la contraseña)
        // Eliminamos el hash para seguridad antes de enviar
        const { password, ...userData } = user; 
        
        res.json({ msg: "Acceso permitido", user: userData });

    } catch (error) {
        console.error("Error al buscar cuenta:", error);
        return res.status(500).json({ msg: "Error interno al buscar datos del usuario." });
    }
};

// ----------------------------------------
// 4. LOGOUT (CERRAR SESIÓN) - Opcional, pero recomendado
// ----------------------------------------
export const logout = (req, res) => {
    // Simplemente borramos la cookie de autenticación
    res.cookie('access_token', '', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0) // Fecha de expiración en el pasado
    });
    res.json({ msg: "Sesión cerrada correctamente." });
};
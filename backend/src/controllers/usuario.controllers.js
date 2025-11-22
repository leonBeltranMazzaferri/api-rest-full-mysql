// src/controllers/users.controllers.js

import jwt from "jsonwebtoken";
import { 
    registerUserDB, 
    getUserByEmailDB,
    getUserByIdDB
} from "../models/usuario.model.js";
import "dotenv/config";

// --- Helper para generar el token JWT (AHORA INCLUYE ROL) ---
const generateToken = (id, email, role = 'user') => { 
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
        expiresIn: "1d", 
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
        const result = await registerUserDB({ nombre, email, password });

        if (result.insertId) {
            const insertedId = result.insertId; 
            const newUser = await getUserByIdDB(insertedId);
            
            const userRole = newUser ? newUser.role : 'user';

            const token = generateToken(insertedId, email, userRole);

            res.cookie('access_token', token, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 24 * 60 * 60 * 1000, 
                path: '/', 
                sameSite: 'Lax', 
            });

            return res.status(201).json({ 
                msg: "Usuario registrado con éxito e inicio de sesión automático", 
                id: insertedId
            });
        }

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ msg: "El email ya está registrado." });
        }
        console.error("Error al registrar:", error);
        return res.status(500).json({ msg: "Error interno del servidor durante el registro." });
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
        const user = await getUserByEmailDB(email);

        if (user && (await user.comparePassword(password))) {
            
            const userRole = user.role || 'user'; 
            const token = generateToken(user.id, user.email, userRole); 

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/', 
                sameSite: 'Lax', 
            });

            return res.json({ msg: "Inicio de sesión exitoso", nombre: user.nombre, role: userRole });

        } else {
            return res.status(401).json({ msg: "Credenciales inválidas (email o contraseña incorrectos)." });
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ msg: "Error interno del servidor." });
    }
};

// ----------------------------------------
// 3. RUTA PROTEGIDA (showAccount / Profile) - DEJAMOS LA FUNCIÓN VACÍA SI NO SE USA
// Si esta ruta se llama, devolverá una respuesta genérica.
// La autenticación debe manejarse en el middleware si es necesario.
// ----------------------------------------
export const showAccount = async (req, res) => {
    // Si esta ruta está en tu router, debes eliminar el middleware 'protect' de ella.
    // Aquí solo devolvemos un mensaje:
    if (req.user && req.user.id) {
         // Si el middleware 'protect' sí se usó y funcionó, devolvemos los datos
         const user = await getUserByIdDB(req.user.id);
         if (user) {
             const { password, ...userData } = user;
             return res.json({ msg: "Acceso permitido", user: userData });
         }
    }
    // Si el frontend ya no llama a esta ruta, esto no importa.
    return res.status(200).json({ msg: "La ruta de perfil no tiene restricción de acceso." });
};

// ----------------------------------------
// 4. LOGOUT (CERRAR SESIÓN)
// ----------------------------------------
export const logout = (req, res) => {
    res.cookie('access_token', '', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        path: '/',
        sameSite: 'Lax'
    });
    res.json({ msg: "Sesión cerrada correctamente." });
};
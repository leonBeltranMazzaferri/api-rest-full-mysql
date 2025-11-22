// src/controllers/usuario.controllers.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
    registerUserDB, 
    getUserByEmailDB,
    getUserByIdDB
} from "../models/usuario.model.js";
import "dotenv/config";

// --- Helper para generar el token JWT ---
const generateToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, {
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
        // Llama a la función del modelo con el nombre correcto: registerUserDB
        const result = await registerUserDB({ nombre, email, password });

        if (result.insertId) {
            const token = generateToken(result.insertId, email);

            res.cookie('access_token', token, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 24 * 60 * 60 * 1000, 
            });

            return res.status(201).json({ 
                msg: "Usuario registrado con éxito e inicio de sesión automático", 
                id: result.insertId 
            });
        }

    } catch (error) {
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
        const user = await getUserByEmailDB(email);

        // Verifica si el usuario existe y si la contraseña es correcta (función devuelta por el modelo)
        if (user && (await user.comparePassword(password))) {
            
            // Usamos user.id (propiedad mapeada en el modelo)
            const token = generateToken(user.id, user.email); 

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000,
            });

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
    // req.user.id viene del payload del token (via middleware 'protect')
    try {
        const user = await getUserByIdDB(req.user.id); 

        if (!user) {
            return res.status(404).json({ msg: "Usuario autenticado no encontrado en DB." });
        }
        
        // Retorna los datos del usuario (sin la contraseña)
        const { password, ...userData } = user; 
        
        res.json({ msg: "Acceso permitido", user: userData });

    } catch (error) {
        console.error("Error al buscar cuenta:", error);
        return res.status(500).json({ msg: "Error interno al buscar datos del usuario." });
    }
};

// ----------------------------------------
// 4. LOGOUT (CERRAR SESIÓN)
// ----------------------------------------
export const logout = (req, res) => {
    res.cookie('access_token', '', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0) // Borra la cookie
    });
    res.json({ msg: "Sesión cerrada correctamente." });
};
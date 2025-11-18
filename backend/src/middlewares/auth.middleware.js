// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import "dotenv/config";

// Middleware para verificar la autenticación
export const protect = (req, res, next) => {
    // 1. Obtener el token de las cookies
    const token = req.cookies.access_token;

    if (!token) {
        // Si no hay token, el usuario no está autenticado
        return res.status(401).json({ msg: "Acceso denegado. No hay token proporcionado." });
    }

    try {
        // 2. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Agregar los datos del usuario decodificado a la solicitud (req.user)
        req.user = decoded; 
        
        // 4. Continuar a la siguiente función (el controlador de la ruta)
        next();
    } catch (err) {
        // Si el token no es válido o ha expirado
        return res.status(401).json({ msg: "Token no válido o expirado." });
    }
};

// Middleware adicional para verificar si es administrador
export const isAdmin = (req, res, next) => {
    // Aquí deberías hacer una consulta a la DB con req.user.id
    // para verificar el campo 'isAdmin' o 'rol'.
    // Por simplicidad, asumiremos que solo el usuario con ID 1 es admin (ejemplo).
    if (req.user && req.user.id === 1) { // ¡ATENCIÓN! Esto es solo un ejemplo.
        next();
    } else {
        return res.status(403).json({ msg: "Acceso prohibido. Requiere permisos de administrador." });
    }
};
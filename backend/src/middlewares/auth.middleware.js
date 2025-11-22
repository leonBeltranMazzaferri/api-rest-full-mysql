// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import "dotenv/config";

// ----------------------------------------
// 1. Middleware principal para verificar el token (PROTECT)
// ----------------------------------------

/**
 * Verifica el token JWT en la cookie 'access_token' y adjunta el payload a req.user.
 */
export const protect = (req, res, next) => {
    // 1. Obtener el token de las cookies
    const token = req.cookies.access_token;

    if (!token) {
        // Si no hay token, el usuario no está autenticado
        return res.status(401).json({ msg: "Acceso denegado. No hay token proporcionado." });
    }

    try {
        // 2. Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Adjuntar los datos del usuario decodificado a la solicitud (req.user)
        // El token contiene al menos: { id: ID_USUARIO, email: EMAIL }
        req.user = decoded; 
        
        // 4. Continuar a la siguiente función (el controlador de la ruta)
        next();
    } catch (err) {
        // Si el token no es válido o ha expirado
        console.error("Error de verificación de token:", err.message);
        return res.status(401).json({ msg: "Token no válido o expirado." });
    }
};

// ----------------------------------------
// 2. Middleware adicional para verificar si es administrador (IS ADMIN)
// ----------------------------------------

/**
 * Verifica si el usuario autenticado tiene rol de administrador.
 * Requiere que el middleware 'protect' se haya ejecutado primero.
 * NOTA: La lógica de verificación de rol DEBERÍA consultar la DB para obtener el rol actual.
 */
export const isAdmin = (req, res, next) => {
    // Es CRUCIAL que el middleware 'protect' ya haya llenado req.user
    if (!req.user) {
        // Si no hay req.user, significa que 'protect' no se ejecutó o falló.
        return res.status(401).json({ msg: "Usuario no autenticado para esta comprobación de rol." });
    }

    // --- LÓGICA TEMPORAL DE EJEMPLO PARA ADMINISTRADOR ---
    // En un entorno real, aquí se consultaría la DB con req.user.id
    // para obtener el campo 'rol' o 'isAdmin'.
    // Ejemplo Temporal: Si el token incluye un campo 'rol' (debería agregarse en el token al logear):
    if (req.user.rol === '1') { 
        next(); // El usuario es administrador, permitir acceso.
    } else {
        // Si no es admin
        return res.status(403).json({ msg: "Acceso prohibido. Requiere permisos de administrador." });
    }
    // --- FIN DE LÓGICA TEMPORAL DE EJEMPLO ---
};
// src/routes/users.routes.js (Modificación)
import { Router } from "express";
import { register, login } from "../controllers/users.controllers.js";
import { protect } from "../middlewares/auth.middleware.js"; // Importar el middleware

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Ruta Protegida: Solo los usuarios autenticados pueden ver su perfil
router.get("/profile", protect, (req, res) => {
    // Si llega aquí, es que el token es válido y la info del usuario está en req.user
    res.json({ 
        msg: "Bienvenido a tu perfil (Ruta Protegida)",
        user: req.user 
    });
});

export default router;
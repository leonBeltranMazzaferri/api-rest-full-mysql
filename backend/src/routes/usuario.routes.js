// src/routes/users.routes.js (FINAL)

import { Router } from "express";
// Importamos todas las funciones necesarias del controlador
import { register, login, showAccount } from "../controllers/usuario.controllers.js"; 
import { protect } from "../middlewares/auth.middleware.js"; // Importar el middleware

const router = Router();

// --- Rutas de Autenticación ---

// POST /api/users/register
router.post("/register", register);

// POST /api/users/login
router.post("/login", login);

// --- Ruta Protegida ---

// GET /api/users/profile
// Usa el middleware 'protect' y luego la función 'showAccount' para obtener los datos
router.get("/profile", protect, showAccount); 

export default router;
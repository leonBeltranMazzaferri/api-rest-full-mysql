import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // Importante para desarrollo
import path from 'path'; // Para manejar rutas absolutas
import { fileURLToPath } from 'url'; // Para módulos ES
import productsRoutes from "./src/routes/products.routes.js";
import usersRoutes from "./src/routes/users.routes.js";

// Determinar el __dirname correcto para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Usamos 3000 por defecto o la variable de entorno

// --- Middlewares Esenciales ---
app.use(express.json()); // Permite a Express leer JSON en el body
app.use(cookieParser()); // Permite a Express leer cookies (necesario para JWT)
app.use(cors({
    origin: 'http://localhost:3000', // Reemplaza con la URL de tu front en producción
    credentials: true // Crucial para permitir el envío de cookies JWT
}));

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS (FRONTEND) ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- RUTAS DE API ---
// Todas tus peticiones de datos deben seguir usando el prefijo /api
app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de la API y el FRONT corriendo en http://localhost:${PORT}`);
});

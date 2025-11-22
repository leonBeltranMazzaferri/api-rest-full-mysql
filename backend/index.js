import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // Importante para desarrollo
import path from 'path'; // Para manejar rutas absolutas
import { fileURLToPath } from 'url'; // Para módulos ES
import productoRoutes from "./src/routes/producto.routes.js";
import usersRoutes from "./src/routes/usuario.routes.js";

// Determinar el __dirname correcto para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Usamos 3000 por defecto o la variable de entorno

// --- Middlewares Esenciales ---
app.use(express.json()); // Permite a Express leer JSON en el body
app.use(cookieParser()); // Permite a Express leer cookies (necesario para JWT)

// 🚨 CORRECCIÓN DE CORS: Cambiamos el origen específico (3008) 
// por el comodín '*' para permitir cualquier origen en desarrollo.
app.use(cors({
    origin: '*', // Acepta peticiones de cualquier puerto o ruta de archivo (file://)
    credentials: true // Crucial para permitir el envío de cookies JWT
}));

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS (FRONTEND) ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- RUTAS DE API ---
// Todas tus peticiones de datos deben seguir usando el prefijo /api
app.use("/api/producto", productoRoutes);
app.use("/api/users", usersRoutes);


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de la API y el FRONT corriendo en http://localhost:${PORT}`);
});
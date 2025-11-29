import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import productoRoutes from "./src/routes/producto.routes.js";
import usersRoutes from "./src/routes/usuario.routes.js";

// Determinar el __dirname correcto para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; 

// --- Middlewares Esenciales ---
app.use(express.json()); 
app.use(cookieParser()); 

// 🚨 CORRECCIÓN CRÍTICA DE CORS 🚨
// Si se usan credenciales, el origen debe ser explícito, no el comodín (*).
const allowedOrigins = [
    // Origen de tu Live Server de VS Code (el que aparece en el error)
    'http://127.0.0.1:5500', 
    // Origen del propio servidor (si accedes a la API desde otra ruta del mismo dominio)
    'http://localhost:3000',
    // Si usas otro puerto (ej. React/Vue/Angular), añádelo aquí:
    // 'http://localhost:8080' 
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origen (como Postman, peticiones de archivos locales o del propio servidor)
        if (!origin) return callback(null, true); 
        
        // Verificar si el origen está en la lista de permitidos
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `El origen CORS ${origin} no está permitido.`;
            // callback(new Error(msg), false); // En producción, usa esto
            callback(null, false); // Para desarrollo, mejor solo negar
        } else {
            callback(null, true);
        }
    },
    credentials: true // Mantenemos en true, que es lo que exige el frontend
}));

// 🟢 CORRECCIÓN DE RUTA (Usando path.resolve para mayor robustez)
// Esto calcula la ruta absoluta de la carpeta 'frontend'
const frontendPath = path.resolve(__dirname, '..', 'frontend');

// 💡 LÍNEA DE DEPURACIÓN: Verifica en tu consola de Node.js qué ruta exacta está sirviendo Express
console.log(`[EXPRESS DEBUG] Intentando servir archivos estáticos desde: ${frontendPath}`);

// 1. Middleware para servir archivos estáticos (index.html, CSS, JS)
app.use(express.static(frontendPath));

// 2. Ruta de Fallback: Si alguien accede a la raíz, forzamos a Express a enviar el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});


// --- RUTAS DE API ---
app.use("/api/producto", productoRoutes);
app.use("/api/users", usersRoutes);


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de la API y el FRONT corriendo en http://localhost:${PORT}`);
});
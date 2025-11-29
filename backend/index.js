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

// 🚨 CONFIGURACIÓN DE CORS 🚨
const allowedOrigins = [
    'http://127.0.0.1:5500', 
    'http://localhost:3000',
    // Puedes añadir más orígenes aquí
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `El origen CORS ${origin} no está permitido.`;
            callback(null, false); 
        } else {
            callback(null, true);
        }
    },
    credentials: true 
}));

// 🟢 CONFIGURACIÓN DE RUTAS Y DEP.
const frontendPath = path.resolve(__dirname, '..', 'frontend');

// 💡 LÍNEA DE DEPURACIÓN 1: Confirma la ruta de archivos estáticos
console.log(`[EXPRESS DEBUG] Intentando servir archivos estáticos desde: ${frontendPath}`);

// 1. Middleware para servir archivos estáticos
app.use(express.static(frontendPath));

// 2. Ruta de Fallback/Raíz Forzada
app.get('/', (req, res) => {
    // 💡 LÍNEA DE DEPURACIÓN 2: Se dispara si se accede a la raíz
    const indexPath = path.join(frontendPath, 'index.html');
    console.log(`[FALLBACK HIT] Intentando enviar index.html desde: ${indexPath}`);
    
    // Intenta enviar el archivo, y si falla, maneja el error y lo muestra en el navegador
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("❌ ERROR al enviar index.html:", err.message);
            // Si falla (por ejemplo, archivo no encontrado o error de permisos), enviamos HTML de error:
            res.status(500).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head><title>Error de Carga</title></head>
                <body style="font-family: sans-serif; padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb;">
                    <h1 style="color: #721c24;">Error 500: No se pudo cargar el index.html</h1>
                    <p>Express falló al intentar cargar el archivo en la ruta:</p>
                    <code style="background-color: #f5f5f5; padding: 5px; border-radius: 4px; display: block; margin-bottom: 15px;">${indexPath}</code>
                    <h3 style="color: #721c24;">Causas más probables:</h3>
                    <ol>
                        <li><strong>Nombre de archivo incorrecto:</strong> El archivo NO se llama <code>index.html</code> (por ejemplo, se llama <code>Index.html</code> o <code>index.htm</code>).</li>
                        <li><strong>Ubicación incorrecta:</strong> El archivo no está DIRECTAMENTE en la carpeta <code>frontend</code>.</li>
                        <li><strong>Error del sistema:</strong> ${err.message || 'Error desconocido al leer el archivo.'}</li>
                    </ol>
                    <p><strong>ACCIONES:</strong> Vuelve a revisar la carpeta <code>frontend</code> y el nombre del archivo.</p>
                </body>
                </html>
            `);
        }
    });
});


// --- RUTAS DE API ---
app.use("/api/producto", productoRoutes);
app.use("/api/users", usersRoutes);


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de la API y el FRONT corriendo en http://localhost:${PORT}`);
});
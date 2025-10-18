import mysql from 'mysql2/promise';

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',      // Cambia si tu servidor no es local
  user: 'root',           // Tu usuario de MySQL
  password: '20062019',           // Tu contraseña (si tienes)
  database: 'tienda',     // La base de datos que creaste
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar la conexión con un bloque asíncrono
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
  }
})();

// Exportar el pool para usarlo en otros archivos
export default pool;

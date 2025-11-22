import mysql from 'mysql2/promise';

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',   
  user: 'root',           
  password: '20062019', // <--- CORRECCIÓN MÁS PROBABLE: Cadena vacía si usas XAMPP por defecto
  database: 'tienda',     
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
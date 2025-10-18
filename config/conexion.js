import mysql from 'mysql2/promise';

export const conexion = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tienda',
    connectionLimit: 5
})

Pool.getConnection()
    .then(conn => {
        console.log('Conexión exitosa a la base de datos');
        conn.release(); // Liberar la conexión después de usarla
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
    });
    export default pool;
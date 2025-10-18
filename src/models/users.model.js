import pool from '../../../api-restful-mysql-capas-mvc/config/conexion.js'
//mostrar todos los usuarios
export const getAllUser = async () => {
    const sql = "SELECT * FROM users"; //consulta SQL
  
    try{ //intenta hacer la promesa
      const conection = await pool.getConnection(); //activa la conexion
      const [rows] = await conection.query(sql); //ejecuta la consulta -> el SQL
      conection.release(); //libera la conexion
      return rows;
    }catch(error){ //si hay un error
        return error
    }
  
}

export const getUserById = async (id) => {
    const sql = `SELECT * FROM users WHERE id_user = ?`; //SQL q quiero ejecutar -> trae todo los q tiene la tabla "tienda"
  
    try{ 
      const conection = await pool.getConnection(); 
      const [rows] = await conection.query(sql, [id]);
      conection.release(); //libera la conexion
      return rows
      
    }catch(error){ //si hay un error
        return error
    }
}

export const createUser = async (values) => {
    const sql = `INSERT INTO users SET ?`
  
    try{ 
      const conection = await pool.getConnection(); 
      const [rows] = await conection.query(sql, [values]);
      conection.release(); 
      return rows
      
  
    }catch(error){ 
      return error
    }
}

export const updateUser = async(newValues, id) => {
    const sql = `UPDATE users SET ? WHERE id_user = ?`;
  
    try{ 
      const conection = await pool.getConnection(); 
      const [rows] = await conection.query(sql, [newValues, id]);
      conection.release(); 
      return rows  
    }catch(error){ 
        return error
    }
}

export const deleteUser = async (id) => {
    const sql = `DELETE FROM users WHERE id_user = ?`;

    try{
      const conection = await pool.getConnection();
      const [result] = await conection.query(sql, [id]);
      conection.release();
      return result; // contiene info como affectedRows
    }catch(error){
      return error;
    }
}

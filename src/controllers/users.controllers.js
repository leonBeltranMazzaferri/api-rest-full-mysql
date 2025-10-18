import pool from '../../../api-restful-mysql-capas-mvc/config/conexion.js'
//ASYNC es una promesa -> tiene que esperar a que le lleguen los datos para continuar la ejecucion
import * as model from '../models/users.model.js'

export const getAllUser = async (req, res) => {
  const rows= await model.getAllUser()
  if(rows.error){
     return res.status(500).send("algo salio mal")
  }
  (rows.length >0)? res.json(rows): res.send("NO HAY USUARIOSSSSSSSS")
}



//mostrar usuarios por id
export const getUserById = async (req, res) => {
    const id = req.params.id;
    const rows = await model.getUserById(id)
    //si viene del catch
    if(rows.error){
     return res.status(500).send("algo salio mal")
  }

  //si viene del try
    (rows[0])? res.json(rows[0]) : res.status(404).send("usuario no existe")
}
//insertar usuarios
export const createUser = async (req, res) => {
    const values = req.body
    const rows = model.createUser(values)
    //catch
    if(rows.error){
     return res.status(500).send("algo salio mal")
    }
  //try
  //res.json(rows)
    res.status(201).send(`nuevo usuario con id ${rows.insertId}`)
    
}
//actializar datos -> cambiar datos de usuarios existentes
export const updateUser = async(req, res) => {
     const id = req.params.id;
     const newValues = req.body
     const rows = model.updateUser(newValues, id)
      //catch
      if(rows.error){
         return res.status(500).send("algo salio mal")
      }

    //try
   (rows.affectedRows == 0)? res.status(404).send("Usuario no existe") : res.send("Datos actualizados")

}
//eliminar usuarios por id
export const deleteUser = async(req, res) => {
    const id = Number(req.params.id);
    const sql = "DELETE FROM users WHERE id_user = ?";
  
    try{ 
      const conection = await pool.getConnection(); 
      const [rows] = await conection.query(sql, [id]);
      conection.release(); 
      
      console.log(rows);
      (rows.affectedRows == 0)? res.status(404).send("Usuario no existe") : res.send("USUARIO ELIMINADO");
  
    }catch(error){ 
      res.status(500).send("algo salio mal")
    }
  }
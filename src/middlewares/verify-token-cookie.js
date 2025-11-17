import jwt from 'jsonwebtoken';
import 'dotenv/config';


// Middleware para verificar el token JWT que esta en la cookie del usuario
// completo con response para entenderlo mejor
export const verifyT = (req, res, next) => {
  //  console.log( req.cookies.access_token)
  try {
    const token = req.cookies.access_token  // esto es permitido por la libreria cookie parser
    if (!token) {
      return res.status(403).json({ message: 'Acceso no Autorizado' })
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // console.log(payload)
    next();
  } catch (error) {
    return res.status(401).json({ message: "Acceso no Autorizado" })
  }
}

//middleware simplificado, sin response ya que la respuesta debe darla el controlador
//este es el que se esta usando
export const verifyToken = (req, res, next) => {
  //console.log( req.cookies.access_token)
  try {
    const token = req.cookies.access_token  // esto es permitido por la libreria cookie parser  
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // console.log(payload)

    //creamos una request para tomar desde aqui el id.user y realizar las consultas,
    // no es necesario pasar el id desde el front
    // es mas seguro porque toma el id, directamente del payload verificado
    req.user = payload
    next();
  } catch { }
  //no hace falta capturar el error, simplemente no continua al controlador
}
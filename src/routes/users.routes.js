import { Router } from "express"
const router = Router()

//importamos el middleware que creamos para validar el token que envia el cliente
import { verifyToken, verifyT } from "../middlewares/verify-token-cookie.js"

//paquetes necesarios para subir las imagenes
import path from "path";
import multer from "multer";
    
//determinamos que la imagen subira en primera instancia a la memoria, no el disco
//una vez que la redimensionemos con sharp la guardaremos en el disco
const storage = multer.memoryStorage();

//Creamos un filtro para que solo se reciban imagenes
const upload = multer({
  storage, fileFilter: (req, file, cb) => {
    if (
      path.extname(file.originalname) != ".jpg" &&
      path.extname(file.originalname) != ".jpeg" &&
      path.extname(file.originalname) != ".gif" &&
      path.extname(file.originalname) != ".png"
     ){
      //rechazamos el archivo
      return cb(null, false)
    }
      //aceptamos el archivo
      return cb(null, true)
  }
})

import {
  verifySesionOpen,
  register,
  login,
  logout,
  showAccount,
  updateAccount,
  uploadImage,
  setPassword,
  deleteAccount
} from "../controllers/users.controllers.js"

//En la raiz se verifica si la sesion esta abierta
router.get('/', verifyToken, verifySesionOpen)

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)

//rutas protegidas
router.get('/account', verifyToken, showAccount)
router.put('/upDate', verifyToken, updateAccount)
router.put('/image', verifyToken, upload.single('imagen'), uploadImage)
router.put('/setPassword', verifyToken, setPassword)
router.delete('/deleteAccount', verifyToken, deleteAccount)

export default router
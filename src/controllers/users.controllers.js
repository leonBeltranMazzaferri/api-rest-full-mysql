// paquetes necesarios para registro y login de usuario
import bcrypt from "bcrypt" //encriptar y verificar password
import jwt from "jsonwebtoken" // generar y verificar token de sesion
import 'dotenv/config' // nos permite utilizar variables de entorno, para manejo de datos sensibles

//paquetes necesarios para manejo de archivos, en nuestro caso las imagenes
import path from "path"  // armar rutas para ubicar archivos
import fs from "fs" // manipulacion de archivos, lo usamos para eliminar la imagen previa
const __dirname = import.meta.dirname // __direname ruta en la que nos encontramos, necesario para armar rutas absolutas para acceder a archivos
import sharp from "sharp" // nos permite optimizar imagen, ej. redimensionar, lo utilizamos junto con multer

//importamos los modulos del modelo 
import * as model from '../model/users.model.js'


export const verifySesionOpen = (req, res) => {
    //si llego hasta aqui, se ha verificado un token valido, hay un usuario con una sesion abierta
    res.status(202).json({ message: "sesion abierta" })
    //status(202) aceptado
}

export const register = async (req, res) => {
    //desestructuramos email y contraseña del body, para verificar que no esten vacios
    const { Email, Pass } = req.body

    //verificamos que los datos se hayan completado
    if (!Email || !Pass) {
        return res.status(422).json({ message: "email y contraseña requeridos" })
    }

    //verificamos que el usuario no exista en la db
    const exists = await model.getUserByEmail(Email)
    if (exists.errno) { return res.status(500).json({ message: `Error en consulta ${rows.errno}` }) }
    if (exists[0]) { return res.json({ message: "Este correo ya se encuentra registrado" }) }

    //si no existe, encriptamos contraseña, inicializamos Image y Type_user
    const passwordHash = await bcrypt.hash(Pass, 10)
    req.body.Pass = passwordHash //colocamos en req.body la contraseña encriptada
    req.body.Image = null
    req.body.Type_user = 0
    try {
        //llamamos al modulo de crear nuevo usuario del modelo, para registrar al nuevo usuario
        const rows = await model.createUser(req.body)

        //si el modelo devuelve un error
        if (rows.errno) {
            return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
        }

        //si el modelo registro 
        //row devuelve muchos datos entre ellos el id creado, es lo que retorno
        res.status(201).json({ message: `Nuevo Usuario Creado: ${req.body.Name}` })
    } catch (error) {
        return res.status(500).json({ message: 'ERROR al registrar' })
    }
}

export const login = async (req, res) => {
    //verificamos haber recibido los datos requeridos     
    const { Email, Pass } = req.body
    if (!Email || !Pass) {
        return res.status(422).json({ message: "email y contraseña requeridos" })
    }

    //verificamos existencia del usuario por email en la db
    const user = await model.getUserByEmail(Email)

    //tomamos la respuesta del modelo y actuamos en consecuencia
    //error ocurrido en el modelo
    if (user.errno) { return res.status(500).json({ message: `Error en consulta ${rows.errno}` }) }
    
    //No hay un usuario registrado con el mail enviado
    if (user[0] === undefined) { return res.status(401).json({ message: "Credenciales invalidas" }) }

    //Hay un usuario registrado con el mail, validamos contraseñas
    const valid = await bcrypt.compare(Pass, user[0].Pass)
    if (!valid) {
        return res.status(401).json({ message: "Credenciales invalidas" })
    }

    // si la contraseña es valida, tenemos que crear una sesion
    //y para esto haremos 2 pasos: 1) crear un token y 2) guardar el token en una cookie en el cliente

    //1) creamos el token
    const payload = { id: user[0].ID_user, name: user[0].Name, type: user[0].Type_user } //carga o datos del token, son publicos (puden verse)
    const expiration = { expiresIn: "8h" } // tiempo de expiracion del token
    const token = jwt.sign(payload, process.env.JWT_SECRET, expiration) //firma digital con la clave secreta que se encuentra en .env

    //2) respondemos al cliente con la orden de crear una cookie
    res.cookie("access_token", token, {
        httpOnly: true, // la cookie solo se puede acceder en el servidor
        // secure: true, //para que solo funciones con https
        sameSite: 'strict', // solo se puede acceder desde el mismo dominio
        // maxAge: 1000 * 60 * 60 //la cookie tiene un tiempo de validez de una hora
    })

    //creo data para enviarla al cliente con el proposito de guardarla en el localStorage,
    //para mostrar el nombre del  usuario en sesion
    const data = user[0].Name
    res.status(202).json({ message: "sesion iniciada ", data })
}

export const logout = (req, res) => {
    //eliminamos la cookie del token
    res.clearCookie("access_token").json({ message: 'session cerrada' })
}

export const showAccount = async (req, res) => {
    // console.log(req.user)
    // req.user se definio en verifyToken y contiene el payload del token
    // const id = parseInt(req.user.id)
    const rows = await model.getUserById(req.user.id)

    //tomamos la respuesta del modelo y actuamos en consecuencia
    //error ocurrido en el modelo
    if (rows.errno) {
        return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
    }

    //rows devuelve un array que contiene un objeto, con [0] tomo solo el objeto  
    (!rows[0]) ? res.status(404).json({ message: 'El usuario no existe' }) : res.json(rows[0])
}

export const updateAccount = async (req, res) => {
    //desestructuro contraseña del body, para verificar que no esten vacio
    const { Name } = req.body
    //verifico que los datos se hayan completado
    if (!Name) {
        return res.status(422).json({ message: "Nuevo nombre requerido" })
    }
    // req.user se definio en verifyToken y contiene el payload del token
    const rows = await model.updateUser(req.user.id, req.body)

    //si row trae el error del catch este es un objeto que tiene una propiedad
    //  "errno" cod. de error
    if (rows.errno) {
        return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
    }
    //row devuelve muchos datos entre ellos "affectedRows" cantidad de registros afectados,
    //  si es igual a cero no se modifico ningun registro
    if (rows.affectedRows == 0) { return res.status(404).json({ message: 'El usuario no existe' }) }
    res.json({ message: 'datos actualizados' })
}

//Esta funcion se utiliza en uploadImage() para redimensionar la imagen, utilizando sharp
const upload = async (file) => { 
    if (!file) {
        return null;
    }
    //determinamos el nombre de la imagen a guardar 
    //path.extname(file.originalname) obtiene la extension del archivo original 
    //Date.now() Un numero que representa los milisegundos del momento actual, con lo cual es unico  
    const imageName = Date.now() + path.extname(file.originalname);

    //definimos el path(lugar) donde se va a guardar la imagen
    const imagePath = path.resolve(__dirname, "../../public/image_users", imageName);

    //redimensionamos la imagen al tamaño que necesitamos
    //resize(300) representa el ancho en px, el alto es proporcional
    //sharp toma la imagen del buffer, la redimensiona y la guarda en el desitno especificado
    await sharp(file.buffer).resize(300).toFile(imagePath);

    //retornamos el nombre de la imagen guardada
    return imageName;
};

//esta funcion se utiliza en uploadImage() para eliminar imagen previa
//y en deleteAccount() para eliminar la imagen del perfil usuario al eliminar la cuenta
const deleteImagePrevia = async(image) => {      
        //definimos la ubicacion de la imagen a eliminar
        const imagePreviaPath = path.resolve(__dirname, "../../public/image_users", image)
        // borramos imagen
        fs.unlinkSync(imagePreviaPath) 
    return
}

export const uploadImage = async (req, res) => {
    //obligamos a subir una imagen
    if (!req.file) {
        return res.json({ message: "debe subir una imagen valida" })
    }

    //enviamos a redimensionar y guardar la nueva imagen en disco
    const Image = await upload(req.file)

    //buscamos si hay imagen previa para eliminar
    const searchImage = await model.getUserById(req.user.id)
    if (searchImage[0].Image !== null) {
        //llamamos a la funcion para que elimine la imagen previa
        deleteImagePrevia(searchImage[0].Image)
    }
   
    //llamamos al modelo para actualizar la imagen en la db
    const rows = await model.updateUser(req.user.id, { Image })
    if (rows.errno) {
        return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
    }
    if (rows.affectedRows == 0) { return res.status(404).json({ message: 'El usuario no existe' }) }
    res.json({ message: 'datos actualizados' })
}

export const setPassword = async (req, res) => {
    //desestructuro contraseña del body, para verificar que no esten vacio
    const { Pass } = req.body
    //verifico que los datos se hayan completado
    if (!Pass) {
        return res.status(422).json({ message: "Nueva contraseña requerida" })
    }
    const passwordHash = await bcrypt.hash(Pass, 10) // console.log(req.body)
    req.body.Pass = passwordHash //coloco en req.body la contraseña encriptada

    // req.user se definio en verifyToken y contiene el payload del token
    const rows = await model.updateUser(req.user.id, req.body)

    //si row trae el error del catch este es un objeto que tiene una propiedad
    //  "errno" cod. de error
    if (rows.errno) {
        return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
    }
    //row devuelve muchos datos entre ellos "affectedRows" cantidad de registros afectados,
    //  si es igual a cero no se modifico ningun registro
    if (rows.affectedRows == 0) { return res.status(404).json({ message: 'El usuario no existe' }) }

    //eliminamos la cookie del token, cerranos sesion
    res.clearCookie("access_token").json({ message: 'Contraseña actualizada' })
}

export const deleteAccount = async (req, res) => {
  // req.user se definio en verifyToken y contiene el payload del token

    // llamamos al modelo para buscar si hay imagen en el perfil para eliminar archivo del disco
    const searchImage = await model.getUserById(req.user.id)
    if (searchImage.errno) {
        return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
    }

    if (searchImage[0].Image !== null) {
        //llamamos a la funcion para que elimine la imagen previa
        deleteImagePrevia(searchImage[0].Image)
    }

   //llamamos al modelo para eliminar todos los datos del usuario
    const rows = await model.deleteUser(req.user.id)

    if (rows.errno) {
        return res.status(500).json({ message: `Error en consulta ${rows.errno}` })
    }

    //por ultimo eliminamos la cookie del token
    res.clearCookie("access_token").json({ message: 'Cuenta eliminada' })
}
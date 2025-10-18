import { Router } from "express"; //Router va entre llaves porque es un modulo de express
import pool from '../../config/conexion.js'
import {getAllUser, getUserById, createUser, updateUser, deleteUser} from "../controllers/users.controllers.js"

const router = Router();

router.get("/users", getAllUser)
router.get("/users/:id", getUserById)
router.post("/users/", createUser)
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
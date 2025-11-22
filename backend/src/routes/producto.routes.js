import { Router } from "express";
import {
    // 🚨 CORRECCIÓN 8: Importamos las funciones del controlador en español/singular
    getAllProducto,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} from "../controllers/producto.controller.js"; // 🚨 CORRECCIÓN 9: Apunta al controlador renombrado

const router = Router();

router.get("/", getAllProducto);
router.get("/:id", getProductoById);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

export default router;
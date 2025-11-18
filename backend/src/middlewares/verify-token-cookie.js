import jwt from "jsonwebtoken";
import "dotenv/config";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) return res.status(401).json({ msg: "No autorizado" });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;

        next();
    } catch {
        return res.status(401).json({ msg: "Token inválido" });
    }
};

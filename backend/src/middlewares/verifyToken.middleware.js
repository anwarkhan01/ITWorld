import admin from "firebase-admin";
import ApiError from "../utils/ApiError.js";


export default async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
    if (!token) return res.status(401).json(new ApiError(300, null, "Token Not Found",));
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture };
        next();
    } catch (err) {
        res.status(401).json(new ApiError(350, null, "Invalid Token"));
    }
}

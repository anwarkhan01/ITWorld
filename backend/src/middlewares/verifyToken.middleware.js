import admin from "../config/firebase.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


const verifyIdToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
    if (!token) {
        return next(new ApiError(401, "Token Not Found"));
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture };
    next();
});


export default verifyIdToken;

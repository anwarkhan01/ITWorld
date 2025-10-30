import express from "express";
import { getAuth } from "firebase-admin/auth";
import asyncHandler from "../utils/asyncHandler.js";
import { getCart, updateCart } from "../controllers/cart.controller.js";

const router = express.Router();

const authenticate = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new ApiError(400, "Firebase token is required"));
    }
    const decoded = await getAuth().verifyIdToken(token);
    req.userId = decoded.uid;

    next();
})

router.get("/get-cart", authenticate, getCart);
router.post("/update-cart", authenticate, updateCart);

export default router;

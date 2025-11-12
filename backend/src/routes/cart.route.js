import express from "express";
import { getCart, updateCart } from "../controllers/cart.controller.js";
import verifyIdToken from "../middlewares/verifyToken.middleware.js";
const router = express.Router();

router.get("/get-cart", verifyIdToken, getCart);
router.post("/update-cart", verifyIdToken, updateCart);

export default router;

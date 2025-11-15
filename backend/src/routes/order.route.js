import express from "express";
import { createOrder, getOrders, getOrderById } from "../controllers/order.controller.js";
import verifyIdToken from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post("/create-order", verifyIdToken, createOrder);
router.get("/get-orders", verifyIdToken, getOrders);
router.get("/get-order/:orderId", verifyIdToken, getOrderById);
export default router;
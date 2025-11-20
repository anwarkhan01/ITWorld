import express from "express";
import { createOrder, getOrders, getOrderById, cancelOrder } from "../controllers/order.controller.js";
import verifyIdToken from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post("/create-order", verifyIdToken, createOrder);
router.get("/get-orders", verifyIdToken, getOrders);
router.get("/get-order/:orderId", verifyIdToken, getOrderById);
router.put("/cancel-order/:orderId", verifyIdToken, cancelOrder)
export default router;
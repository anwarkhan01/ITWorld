import express from "express";
import { createOrder, getOrders, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();
router.post("/create-order", createOrder);
router.get("/get-orders", getOrders);
router.get("/get-order/:id", getOrderById);
export default router;
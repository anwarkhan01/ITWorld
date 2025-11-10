import { getOrders } from "../controllers/admin.controller.js";
import express from "express"

const router = express.Router()
router.get("/get-orders", getOrders)

export default router
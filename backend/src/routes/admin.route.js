import express from "express"
import {
    getAllOrders,
    getOrdersByStatus,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllProducts,
    bulkUploadProducts,
    bulkUpdateProducts,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    clearAllProducts,
    getDashboardStats
} from "../controllers/admin.controller.js"

const router = express.Router()

// ============= DASHBOARD =============
router.get("/dashboard/stats", getDashboardStats)

// ============= ORDER ROUTES =============
router.get("/orders", getAllOrders)
router.get("/orders/status/:status", getOrdersByStatus)
router.get("/orders/:orderId", getOrderById)
router.patch("/orders/:orderId/status", updateOrderStatus)
router.delete("/orders/:orderId", deleteOrder)

// ============= USER ROUTES =============
router.get("/users", getAllUsers)
router.get("/users/:userId", getUserById)
router.patch("/users/:userId", updateUser)
router.delete("/users/:userId", deleteUser)

// ============= PRODUCT ROUTES =============
router.get("/products", getAllProducts)
router.patch("/products/:productId", updateProduct)
router.delete("/products/:productId", deleteProduct)
router.post("/products/bulk-delete", bulkDeleteProducts)
router.delete("/products/clear-all", clearAllProducts)

export default router
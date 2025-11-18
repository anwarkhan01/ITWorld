import User from "../models/user.model.js"
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import Order from "../models/order.model.js"
import xlsx from "xlsx"


const STATUS_MAP = {
    pending: "pending",
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled"
};

const normalize = (str) =>
    String(str).trim().toLowerCase().replace(/\s+/g, "");

// ============= ORDER MANAGEMENT =============

const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query

    const skip = (page - 1) * limit
    const sortOrder = order === 'asc' ? 1 : -1

    const orders = await Order.find({})
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('firebaseUid', 'name email')

    const total = await Order.countDocuments()

    res.json(new ApiResponse(200, "Orders fetched successfully", {
        orders,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    }))
})

const getOrdersByStatus = asyncHandler(async (req, res) => {
    const { status } = req.params

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status. Valid statuses: " + validStatuses.join(', '))
    }

    const orders = await Order.find({ status })
        .populate('firebaseUid', 'name email')
        .sort({ createdAt: -1 })

    res.json(new ApiResponse(200, `Orders with status '${status}' fetched successfully`, orders))
})

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const order = await Order.findOne({ orderId })
        .populate('firebaseUid', 'name email phone')

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    res.json(new ApiResponse(200, "Order fetched successfully", order))
})

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    let { status } = req.body


    const key = normalize(status);

    const finalStatus = STATUS_MAP[key];
    if (!finalStatus) {
        throw new ApiError(400, "Invalid status");
    }

    const order = await Order.findOneAndUpdate(
        { orderId },
        { status: finalStatus, updatedAt: Date.now() },
        { new: true, runValidators: true }
    )

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    res.json(new ApiResponse(200, "Order status updated successfully", order))
})

const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const order = await Order.findOneAndDelete({ orderId })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    res.json(new ApiResponse(200, "Order deleted successfully", order))
})

// ============= USER MANAGEMENT =============

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query

    const skip = (page - 1) * limit

    const query = search ? {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ]
    } : {}

    const users = await User.find(query)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.json(new ApiResponse(200, "Users fetched successfully", {
        users,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    }))
})

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId).select('-password -refreshToken')

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 })

    res.json(new ApiResponse(200, "User fetched successfully", { user, orders }))
})

const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { name, email, phone, isActive } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select('-password -refreshToken')

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    res.json(new ApiResponse(200, "User updated successfully", user))
})

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    await Cart.deleteMany({ userId })

    res.json(new ApiResponse(200, "User deleted successfully", user))
})

// ============= PRODUCT MANAGEMENT (BULK UPLOAD) =============

const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, category, search = '' } = req.query

    const skip = (page - 1) * limit

    const query = {}
    if (category) query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }

    const products = await Product.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })

    const total = await Product.countDocuments(query)

    res.json(new ApiResponse(200, "Products fetched successfully", {
        products,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    }))
})

const bulkUploadProducts = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Excel file is required")
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    if (data.length === 0) {
        throw new ApiError(400, "Excel sheet is empty")
    }

    const products = []
    const errors = []

    for (let i = 0; i < data.length; i++) {
        const row = data[i]

        try {
            if (!row.name || !row.price || !row.category) {
                errors.push({
                    row: i + 2,
                    error: "Missing required fields (name, price, category)",
                    data: row
                })
                continue
            }

            const productData = {
                name: row.name,
                description: row.description || '',
                price: parseFloat(row.price),
                category: row.category,
                stock: parseInt(row.stock) || 0,
                images: row.images ? row.images.split(',').map(img => img.trim()) : [],
                brand: row.brand || '',
                sku: row.sku || '',
                weight: row.weight ? parseFloat(row.weight) : null,
                dimensions: row.dimensions || '',
                isActive: row.isActive !== undefined ? Boolean(row.isActive) : true
            }

            products.push(productData)
        } catch (error) {
            errors.push({
                row: i + 2,
                error: error.message,
                data: row
            })
        }
    }

    let insertedProducts = []

    if (products.length > 0) {
        insertedProducts = await Product.insertMany(products, { ordered: false })
    }

    res.json(new ApiResponse(200, "Bulk upload completed", {
        totalRows: data.length,
        successCount: insertedProducts.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
    }))
})

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const updateData = req.body

    const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
    )

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    res.json(new ApiResponse(200, "Product updated successfully", product))
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params

    const product = await Product.findByIdAndDelete(productId)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    res.json(new ApiResponse(200, "Product deleted successfully", product))
})

const bulkDeleteProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body

    if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new ApiError(400, "Product IDs array is required")
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } })

    res.json(new ApiResponse(200, "Products deleted successfully", {
        deletedCount: result.deletedCount
    }))
})

const bulkUpdateProducts = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Excel file is required")
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    if (data.length === 0) {
        throw new ApiError(400, "Excel sheet is empty")
    }

    const bulkOps = []
    const errors = []

    for (let i = 0; i < data.length; i++) {
        const row = data[i]

        try {
            if (!row._id && !row.sku) {
                errors.push({
                    row: i + 2,
                    error: "Missing product identifier (_id or sku)",
                    data: row
                })
                continue
            }

            const filter = row._id ? { _id: row._id } : { sku: row.sku }
            const updateData = {}

            if (row.name) updateData.name = row.name
            if (row.description !== undefined) updateData.description = row.description
            if (row.price) updateData.price = parseFloat(row.price)
            if (row.category) updateData.category = row.category
            if (row.stock !== undefined) updateData.stock = parseInt(row.stock)
            if (row.images) updateData.images = row.images.split(',').map(img => img.trim())
            if (row.brand) updateData.brand = row.brand
            if (row.isActive !== undefined) updateData.isActive = Boolean(row.isActive)

            bulkOps.push({
                updateOne: {
                    filter,
                    update: { $set: updateData }
                }
            })
        } catch (error) {
            errors.push({
                row: i + 2,
                error: error.message,
                data: row
            })
        }
    }

    let result = { modifiedCount: 0, matchedCount: 0 }

    if (bulkOps.length > 0) {
        result = await Product.bulkWrite(bulkOps)
    }

    res.json(new ApiResponse(200, "Bulk update completed", {
        totalRows: data.length,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
    }))
})

const clearAllProducts = asyncHandler(async (req, res) => {
    const result = await Product.deleteMany({})

    res.json(new ApiResponse(200, "All products deleted successfully", {
        deletedCount: result.deletedCount
    }))
})

// ============= DASHBOARD STATS =============

const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalProducts = await Product.countDocuments()

    const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: "$productData.totalPrice" } } }
    ])

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('firebaseUid', 'name email')

    const ordersByStatus = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
        .limit(10)
        .select('name stock')

    res.json(new ApiResponse(200, "Dashboard stats fetched successfully", {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        ordersByStatus,
        lowStockProducts
    }))
})

export {
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
}
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js"
import Product from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import admin from "../config/firebase.js";
import crypto from "crypto"
import ApiError from "../utils/ApiError.js";

const createOrder = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    const user = await User.findOne({
        $or: [{ firebaseUid: uid }, { email }],
    });
    if (!user) return next(new ApiError(401, "Unauthorized"));

    const { productData, shipping, paymentMethod, meta, orderToken } = req.body;

    if (!productData || !shipping || !paymentMethod) {
        return next(new ApiError(400, "Missing required fields: productData, shipping, and paymentMethod are required"));
    }

    // Validate productData
    if (!productData.products || !Array.isArray(productData.products) || productData.products.length === 0) {
        return next(new ApiError(400, "Product data must contain at least one product"));
    }

    // Validate shipping address
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.state || !shipping.pincode) {
        return next(new ApiError(400, "Incomplete shipping address"));
    }

    // Validate payment method
    const validPaymentMethods = ["cod", "upi", "card", "razorpay"];
    if (!validPaymentMethods.includes(paymentMethod)) {
        return next(new ApiError(400, "Invalid payment method"));
    }

    // prevent duplicate order
    const existing = await Order.findOne({ orderToken });
    if (existing)
        return res.json(
            new ApiResponse(200, "Duplicate request ignored - existing order found", {
                orderId: existing._id,
                existing: true,
            })
        );
    // Fix N+1 query problem by fetching all products at once
    const productIds = productData.products.map(p => p.product_id);
    const products = await Product.find({ product_id: { $in: productIds } }).lean();
    const productMap = new Map(products.map(p => [p.product_id, p]));

    // Enrich product data
    for (const item of productData.products) {
        const prod = productMap.get(item.product_id);
        if (prod) {
            item.image = prod.image || null;
            item.product_name = prod.product_name || "";
            item.product_id = prod.product_id;
        } else {
            item.image = null;
            item.product_name = "";
        }
    }

    const simulatedPaymentId = `PAY_${crypto.randomBytes(8).toString("hex")}`;

    const order = new Order({
        firebaseUid: uid,
        useremail: user.email,
        productData,
        shipping,
        paymentMethod,
        meta,
        orderToken,
        paymentId: simulatedPaymentId,
    });

    await order.save();

    return res.json(
        new ApiResponse(200, "Order placed successfully", {
            orderId: order._id,
            paymentId: simulatedPaymentId,
        })
    );
});

// export const getUserOrders = async (req, res) => {
//     try {
//         const user = req.user;
//         if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

//         const orders = await Order.find({ userid: user.mongoId || user.uid })
//             .sort({ createdAt: -1 })
//             .lean();

//         res.status(200).json({ success: true, orders });
//     } catch (err) {
//         console.error("Error fetching orders:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

const getOrders = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    if (!uid) {
        return next(new ApiError(401, "Unauthorized"));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find({ firebaseUid: uid })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments({ firebaseUid: uid })
    ]);

    return res.json(new ApiResponse(200, orders.length > 0 ? "Orders fetched successfully" : "No orders found", {
        count: orders.length,
        orders: orders.map((o) => ({
            _id: o._id,
            orderToken: o.orderToken,
            paymentId: o.paymentId,
            productData: o.productData,
            shipping: o.shipping,
            paymentMethod: o.paymentMethod,
            status: o.status,
            createdAt: o.createdAt,
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    }));
})
const getOrderById = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    if (!uid) {
        return next(new ApiError(401, "Unauthorized"));
    }

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, firebaseUid: uid }).lean();

    if (!order) {
        return next(new ApiError(404, "Order not found"));
    }

    return res.json(new ApiResponse(200, "Order fetched successfully", order));
});


export { createOrder, getOrders, getOrderById };
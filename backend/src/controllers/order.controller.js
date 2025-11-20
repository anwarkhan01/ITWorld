import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import ApiError from "../utils/ApiError.js";

const createOrder = asyncHandler(async (req, res, next) => {
    const { uid, email } = req.user;
    console.log("Create order request received");

    // Generate unique orderId
    const orderId = [...crypto.getRandomValues(new Uint8Array(12))]
        .map((b) => b.toString(36).padStart(2, "0"))
        .join("")
        .slice(0, 20)
        .toUpperCase();

    const user = await User.findOne({
        $or: [{ firebaseUid: uid }, { email }],
    });

    if (!user) return next(new ApiError(401, "Unauthorized"));

    const { productData, shipping, paymentMethod, meta } = req.body;

    // Validation
    if (!productData || !shipping || !paymentMethod) {
        return next(
            new ApiError(
                400,
                "Missing required fields: productData, shipping, and paymentMethod are required"
            )
        );
    }

    if (
        !productData.products ||
        !Array.isArray(productData.products) ||
        productData.products.length === 0
    ) {
        return next(new ApiError(400, "Product data must contain at least one product"));
    }

    if (
        !shipping.name ||
        !shipping.phone ||
        !shipping.address ||
        !shipping.city ||
        !shipping.state ||
        !shipping.pincode
    ) {
        return next(new ApiError(400, "Incomplete shipping address"));
    }

    const validPaymentMethods = ["sp", "cod", "upi", "card", "payu", "online"];
    if (!validPaymentMethods.includes(paymentMethod)) {
        return next(new ApiError(400, "Invalid payment method"));
    }

    // Fetch and enrich product data
    const productIds = productData.products.map((p) => p.product_id);
    const products = await Product.find({ product_id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p.product_id, p]));

    const enrichedProducts = productData.products.map((item) => {
        const prod = productMap.get(item.product_id);
        return {
            ...item,
            product_name: prod?.product_name || "",
            image: prod?.image || null,
            product_id: prod?.product_id || item.product_id,
        };
    });

    productData.products = enrichedProducts;

    // Create order (for COD and store pickup)
    const order = new Order({
        firebaseUid: uid,
        useremail: user.email,
        productData,
        shipping,
        paymentMethod,
        orderId: orderId,
        meta: meta || { createdAt: new Date(), fromBuyNow: false },
        paymentId: null,
        status: "pending",
    });

    await order.save();

    return res.json(
        new ApiResponse(200, "Order placed successfully", {
            orderId: order.orderId, // Return custom orderId
        })
    );
});

const getOrders = asyncHandler(async (req, res, next) => {
    const uid = req.user.uid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find({ firebaseUid: uid }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Order.countDocuments({ firebaseUid: uid }),
    ]);

    return res.json(
        new ApiResponse(
            200,
            orders.length > 0 ? "Orders fetched successfully" : "No orders found",
            {
                count: orders.length,
                orders: orders.map((o) => ({
                    orderId: o.orderId,
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
                    pages: Math.ceil(total / limit),
                },
            }
        )
    );
});

const getOrderById = asyncHandler(async (req, res, next) => {
    const uid = req.user.uid;
    const { orderId } = req.params;
    console.log("Fetching order with orderId:", orderId);

    const order = await Order.findOne({ orderId, firebaseUid: uid }).lean();

    if (!order) {
        return next(new ApiError(404, "Order not found"));
    }

    return res.json(new ApiResponse(200, "Order fetched successfully", order));
});

const cancelOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { cancellation_reason } = req.body
    if (!orderId) {
        next(new ApiError(300, "OrderId is required for cancellation of the order"))
    }
    const resp = await Order.findOneAndUpdate(
        { $and: [{ orderId, firebaseUid: req.user.uid }] },
        {
            $set:
            {
                status: "cancelled",
                "cancelled.isCancelled": true,
                "cancelled.cancellation_reason": cancellation_reason,
                "cancelled.cancelledAt": new Date()
            }
        },
        { new: true }
    )

    console.log(resp)
    res.json(new ApiResponse(200, "Order Cancelled Successfully!", resp))
})

export { createOrder, getOrders, getOrderById, cancelOrder };
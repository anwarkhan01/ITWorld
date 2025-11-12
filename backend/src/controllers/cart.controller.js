import asyncHandler from "../utils/asyncHandler.js";
import Cart from "../models/cart.model.js"
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const getCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ userId: req.userId }).lean();
    res.json(new ApiResponse(200, "Cart Data Fetch Successfully", cart));
})
const updateCart = asyncHandler(async (req, res, next) => {
    const { cart } = req.body;
    if (!Array.isArray(cart)) return next(new ApiError(400, "Cart is not in required format"));

    // Validate and sanitize cart items
    const items = cart
        .filter((i) => i.id && i.quantity && i.quantity > 0)
        .map((i) => ({
            productId: String(i.id).trim(),
            quantity: Math.max(1, Math.min(100, parseInt(i.quantity) || 1)) // Limit quantity between 1-100
        }));

    if (items.length === 0 && cart.length > 0) {
        return next(new ApiError(400, "Invalid cart items provided"));
    }

    const updatedCart = await Cart.findOneAndUpdate(
        { userId: req.userId },
        { items },
        { new: true, upsert: true }
    );

    res.json(new ApiResponse(200, "Cart Updated Successfully", updatedCart));
})

export { getCart, updateCart }
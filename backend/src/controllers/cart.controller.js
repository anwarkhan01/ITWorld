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
    if (!Array.isArray(cart)) return next(new ApiError(300, "Cart is not in required format"));

    const items = cart.map((i) => ({ productId: i.id, quantity: i.quantity }));

    const updatedCart = await Cart.findOneAndUpdate(
        { userId: req.userId },
        { items },
        { new: true, upsert: true }
    );

    res.json(new ApiResponse(200, "Cart Updated Successfully", updatedCart))
})

export { getCart, updateCart }
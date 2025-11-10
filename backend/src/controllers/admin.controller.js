import User from "../models/user.model.js"
import Cart from "../models/cart.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
const getOrders = asyncHandler(async (req, res, next) => {
    res.json(new ApiResponse(200, "We Will Add Admin Router Here "))
})
export { getOrders }
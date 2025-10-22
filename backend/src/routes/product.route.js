import express from "express";
import Product from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const router = express.Router();

router.get("/getproducts", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(new ApiResponse(200, products, "product data fethced successfullly!"));
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

export default router;

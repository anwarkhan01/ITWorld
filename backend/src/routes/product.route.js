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

router.get("/random", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const products = await Product.aggregate([{ $sample: { size: limit } }]);
        res.json(new ApiResponse(200, { products: products, count: products.length }, "random product fetched successfully"))
        // res.json({ count: products.length, products }); 
    } catch (error) {
        console.error("Random fetch error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/search", async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, name } = req.query;

        const filters = {};

        if (category) filters.category = category;
        if (brand) filters.brand = brand;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = Number(minPrice);
            if (maxPrice) filters.price.$lte = Number(maxPrice);
        }
        if (name) {
            filters.product_name = { $regex: name, $options: "i" };
        }

        const products = await Product.find(filters)
            .sort({ price: 1 })
            .limit(50); // cap result for performance

        res.json({ count: products.length, products });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;

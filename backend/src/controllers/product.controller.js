import XLSX from "xlsx";
import path from "path";
import Product from "../models/product.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

function parseSpecs(specString) {
    if (!specString || typeof specString !== "string") return {};
    const specs = {};
    const entries = specString.split(";");
    for (let entry of entries) {
        const [key, value] = entry.split(":").map((s) => s.trim());
        if (key && value) specs[key] = value;
    }
    return specs;
}

const importProducts = asyncHandler(async (req, res, next) => {
    try {
        const filePath = path.join(process.cwd(), "assets", "electronic_products.csv");
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const filteredData = data.filter((item) =>
            Object.values(item).some((val) => val !== undefined && val !== null && val !== "")
        );
        console.log(`Importing ${data.length - 1} products from Excel...`);

        for (const item of filteredData) {
            // Normalize fields to match schema
            const updateData = {
                product_id: item.id || item.product_id || null,
                product_name: item.product_name || "",
                brand: item.brand || "",
                price: Number(item.price) || 0,
                intro_description: item.intro_description || item.intro || "",
                image: item.image || "",
                category: item.category || "Other",
                specs: typeof item.specs === "object" && item.specs !== null
                    ? item.specs
                    : parseSpecs(item.specs),

                highlights: Array.isArray(item.highlights)
                    ? item.highlights
                    : item.highlights
                        ? String(item.highlights).split(",").map((h) => h.trim())
                        : [],
                features: Array.isArray(item.features)
                    ? item.features
                    : item.features
                        ? String(item.features).split(",").map((f) => f.trim())
                        : [],
                warranty: item.warranty

            };

            await Product.findOneAndUpdate(
                { product_id: updateData.product_id }, // match existing
                updateData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        res.json(new ApiResponse(200, "Products Imported/Updated Successfully"))
        console.log("Products imported/updated successfully");
    } catch (err) {
        res.json(new ApiError(400, "Some Error Occured While Imporing Data From Excel To MongoDB Database", err, err.stack))
        console.error("Error importing products:", err.message);
    }
})

const getproducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find();
    res.json(new ApiResponse(200, "product data fethced successfullly!", products));
})

const getRandomProducts = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const products = await Product.aggregate([{ $sample: { size: limit } }]);
    res.json(new ApiResponse(200, "random products fetched successfully", { products: products, count: products.length }))
})

const getFilterProducts = asyncHandler(async (req, res, next) => {
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
        .limit(50);

    res.json(new ApiError(200, "Filtered Product Fetched Successfully", { count: products.length, products },))
})

export { importProducts, getproducts, getRandomProducts, getFilterProducts }


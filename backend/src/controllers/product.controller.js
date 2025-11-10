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

        if (filteredData.length === 0) {
            return next(new ApiError(400, "No valid data found in the file"));
        }

        console.log(`Importing ${filteredData.length} products from Excel...`);

        // Use bulk operations for better performance
        const bulkOps = filteredData.map((item) => {
            const updateData = {
                product_id: item.id || item.product_id || null,
                product_name: item.product_name || "",
                brand: item.brand || "",
                price: Number(item.price) || 0,
                intro_description: item.intro_description || item.intro || "",
                image: item.image || "",
                category: item.category || "Other",
                sub_category: item.sub_category || "",
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

            return {
                updateOne: {
                    filter: { product_id: updateData.product_id },
                    update: { $set: updateData },
                    upsert: true
                }
            };
        });

        // Execute bulk operations in batches
        const batchSize = 100;
        for (let i = 0; i < bulkOps.length; i += batchSize) {
            const batch = bulkOps.slice(i, i + batchSize);
            await Product.bulkWrite(batch, { ordered: false });
        }

        console.log("Products imported/updated successfully");
        return res.json(new ApiResponse(200, `Successfully imported/updated ${filteredData.length} products`));
    } catch (err) {
        console.error("Error importing products:", err.message);
        return next(new ApiError(500, "Error occurred while importing products", err.message));
    }
})

const getproducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find().skip(skip).limit(limit).lean(),
        Product.countDocuments()
    ]);

    res.json(new ApiResponse(200, "Product data fetched successfully!", {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    }));
})

const getRandomProducts = asyncHandler(async (req, res, next) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Cap at 100
    const products = await Product.aggregate([{ $sample: { size: limit } }]);
    res.json(new ApiResponse(200, "Random products fetched successfully", { products: products, count: products.length }));
})

const getFilterProducts = asyncHandler(async (req, res, next) => {
    const { category, brand, minPrice, maxPrice, name, page = 1, limit = 50, sort = "price", order = "asc" } = req.query;

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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const [products, total] = await Promise.all([
        Product.find(filters)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(filters)
    ]);

    res.json(new ApiResponse(200, "Filtered Product Fetched Successfully", {
        count: products.length,
        products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    }));
})

const getCategorizedProducts = asyncHandler(async (req, res, next) => {
    const {
        category,
        brand,
        minPrice,
        maxPrice,
        sort = "price",
        order = "asc",
        page = 1,
        limit = 20
    } = req.query;
    const subcategory = req.query.subcategory || req.query.subCategory;
    const filters = {};

    // Build category filters
    if (category) {
        filters.category = { $regex: new RegExp(category, 'i') };
    }

    if (subcategory) {
        filters.sub_category = { $regex: new RegExp(subcategory, 'i') };
    }

    if (brand) {
        const brands = brand.split(",").map((b) => b.trim()).filter(Boolean);
        if (brands.length > 1) {
            filters.brand = { $in: brands.map((b) => new RegExp(b, "i")) };
        } else {
            filters.brand = { $regex: new RegExp(brands[0], "i") };
        }
    }

    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = Number(minPrice);
        if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const [products, total] = await Promise.all([
        Product.find(filters)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(filters)
    ]);

    res.json(new ApiResponse(200, "Categorized Products Fetched Successfully", {
        category,
        products,
        total: products.length,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalDocuments: total,
            totalPages: Math.ceil(total / limitNum)
        }
    }));
});

export { importProducts, getproducts, getRandomProducts, getFilterProducts, getCategorizedProducts }


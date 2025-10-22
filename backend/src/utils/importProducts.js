import XLSX from "xlsx";
import path from "path";
import Product from "../models/product.model.js";

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

export async function importProducts() {
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

        console.log("Products imported/updated successfully");
    } catch (err) {
        console.error("Error importing products:", err.message);
    }
}

import XLSX from "xlsx";
import path from "path";
import Product from "../models/product.model.js"

export async function importProducts() {
    const filePath = path.join(process.cwd(), "assets", "electronic_products.csv");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const item of data) {
        // If a product with the same productId exists, update it; else, insert new
        await Product.findOneAndUpdate(
            { product_id: item.id || item.product_id }, // Excel ID
            {
                product_id: item.id || item.product_id || null,
                product_name: item.product_name,
                brand: item.brand,
                price: item.price,
                intro_description: item.intro_description,
                image: item.image,
                category: item.category,
                specs: item.specs,
                highlights: item.highlights,
                features: item.features,
                warranty: item.warranty
            },
            { upsert: true, new: true }
        );
    }

    console.log("Products imported/updated successfully");
}

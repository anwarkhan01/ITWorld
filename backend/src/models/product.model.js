import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    product_id: { type: String, unique: true, sparse: true }, // from Excel
    product_name: String,
    brand: String,
    price: Number,
    intro_description: String,
    image: String,
    category: String,
    specs: Object,
    highlights: [String],
    features: [String],
    warranty: String
});

export default mongoose.model("Product", productSchema);

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    product_id: { type: String, unique: true, sparse: true, index: true }, // from Excel
    product_name: { type: String, index: true },
    brand: { type: String, index: true },
    price: { type: Number, index: true },
    intro_description: String,
    image: String,
    category: { type: String, index: true },
    sub_category: { type: String },
    specs: Object,
    highlights: [String],
    features: [String],
    warranty: String
});

// Compound indexes for common queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ product_name: 'text' }); // Text search index

export default mongoose.model("Product", productSchema);

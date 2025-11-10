import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
});

const CartSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true, index: true },
        items: [CartItemSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);

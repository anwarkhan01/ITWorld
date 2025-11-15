import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        product_id: { type: String, required: true },
        product_name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        product_price: { type: Number, required: true, min: 0 },
        image: { type: String, default: null },
    },
    { _id: false }
);

const productDataSchema = new mongoose.Schema(
    {
        totalPrice: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, min: 0 },
        tax: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 0 },
        products: { type: [productSchema], required: true },
    },
    { _id: false }
);

const shippingSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "India" },
        pincode: { type: String, required: true },
    },
    { _id: false }
);

const metaSchema = new mongoose.Schema(
    {
        fromBuyNow: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        firebaseUid: { type: String, required: true, index: true }, // NOT unique - users can have multiple orders
        useremail: { type: String },
        productData: { type: productDataSchema, required: true },
        shipping: { type: shippingSchema, required: true },
        paymentMethod: {
            type: String,
            enum: ["sp", "cod", "upi", "card", "payu", "online"],
            required: true,
        },
        orderId: { type: String, required: true },
        paymentId: { type: String, default: null }, // will hold Razorpay/Stripe payment ID later
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },
        meta: { type: metaSchema, required: true },
    },
    { timestamps: true }
);

orderSchema.index({ firebaseUid: 1, createdAt: -1 }); // optimized query for user order history
orderSchema.index({ orderToken: 1 }); // unique index already defined in schema
orderSchema.index({ paymentId: 1 }); // index for payment lookup (sparse index for null values)

export default mongoose.model("Order", orderSchema);

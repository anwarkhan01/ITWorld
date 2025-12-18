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
    firebaseUid: { type: String, required: true, index: true },
    useremail: { type: String },
    productData: { type: productDataSchema, required: true },
    shipping: { type: shippingSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ["sp", "upi", "cc", "dc", "nb", "emi", "upi_p", "unknown"],
      required: true,
    },
    orderId: { type: String, required: true },
    paymentId: { type: String, default: null },
    txnId: { type: String, default: null },
    deliveryDate: { type: String, default: null },
    deliveredOn: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "ready",
        "pickedup",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    cancelled: {
      isCancelled: { type: Boolean, default: false },
      cancellation_reason: { type: String, default: null },
      cancelledAt: { type: Date, default: null },
      refunded: { type: Boolean, default: false },
      refundId: { type: String, default: null },
      refundDate: { type: Date, default: null },
      refundAmount: { type: Number, default: null },
    },
    pickup: {
      type: {
        type: String,
        enum: ["store"],
        default: "store",
      },
      readyAt: Date,
      pickedUpAt: Date,
      isAvailableAtStore: { type: Boolean, default: false },
      storeAddress: {
        type: String,
        default:
          "Shop No. 21, Golden Park, Behind Parvati Theater, Station Road, Vasai (West), Palghar - 401 202",
      },
    },

    meta: { type: metaSchema, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ firebaseUid: 1, createdAt: -1 }); // optimized query for user order history
orderSchema.index({ paymentId: 1 }); // index for payment lookup (sparse index for null values)

export default mongoose.model("Order", orderSchema);

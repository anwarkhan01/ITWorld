import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true }, // Firebase UID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    authProvider: { type: String },
    emailVerified: { type: Boolean },
    photoURL: { type: String },
    phone: { type: String },

    address: {
        fullAddress: { type: String },
        landmark: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String, default: "India" },
        pincode: { type: String },
    },
}, { timestamps: true });

export default mongoose.model("User", userSchema);

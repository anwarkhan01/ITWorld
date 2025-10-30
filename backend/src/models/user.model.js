import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true }, // Firebase UID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authProvider: { type: String },
    emailVerified: { type: Boolean },
    photoURL: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);

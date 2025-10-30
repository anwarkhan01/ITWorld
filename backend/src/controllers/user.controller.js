import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import admin from "../config/firebase.js";


const googleAuthController = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new ApiError(400, "Firebase token is required"));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        {
            $set: {
                name: name || "User",
                photoURL: picture || "",
                authProvider: "google",
                emailVerified: true,
            },
            $setOnInsert: {
                email: email
            }
        },
        { new: true, upsert: true }
    );

    const createdAt = Math.floor(new Date(user.createdAt).getTime() / 1000);
    const updatedAt = Math.floor(new Date(user.updatedAt).getTime() / 1000);

    const message = createdAt === updatedAt
        ? "User Created Successfully"
        : "User Updated Successfully";

    res.json(new ApiResponse(200, message, user));
})

const emailSignUp = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { name, email, photoURL } = req.body;
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email: firebaseEmail, email_verified } = decodedToken;

    const existingUser = await User.findOne({ firebaseUid: uid });
    if (existingUser) return next(new ApiError(400, "User already exists"));

    const user = await User.create({
        firebaseUid: uid,
        email: email || firebaseEmail,
        name: name || email?.split('@')[0] || "User",
        photoURL: photoURL || "",
        authProvider: "email",
        emailVerified: email_verified
    });

    res.json(new ApiResponse(200, "User created successfully", user));
});

const emailLogin = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return next(new ApiError(404, "User not found. Please sign up first"));

    await user.save();

    res.json(new ApiResponse(200, "User logged in successfully", user));
});

export { googleAuthController, emailSignUp, emailLogin }
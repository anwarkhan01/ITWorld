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

const updatePhone = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { phone } = req.body;
    console.log(req.body)
    if (!phone) return next(new ApiError(400, "Phone number is required"));

    const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $set: { phone: phone } },
        { new: true, runValidators: true }
    );

    if (!user) return next(new ApiError(404, "User not found"));

    return res.json(new ApiResponse(200, "Phone number updated successfully", user));
});

const updateAddress = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new ApiError(400, "Firebase token is required"));

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { address } = req.body;
    if (!address) return next(new ApiError(400, "Address object is required"));

    const updateFields = {};
    if (address.fullAddress !== undefined)
        updateFields["address.fullAddress"] = address.fullAddress;
    if (address.landmark !== undefined)
        updateFields["address.landmark"] = address.landmark;
    if (address.city !== undefined)
        updateFields["address.city"] = address.city;
    if (address.state !== undefined)
        updateFields["address.state"] = address.state;
    if (address.country !== undefined)
        updateFields["address.country"] = address.country;
    if (address.pincode !== undefined)
        updateFields["address.pincode"] = address.pincode;

    const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!user) return next(new ApiError(404, "User not found"));

    return res.json(
        new ApiResponse(200, "Address updated successfully", user)
    );
});


// * TODO: implement pincode deliverability check
const checkPincode = asyncHandler((req, res, next) => {
    res.json(new ApiResponse(300, "We will implement this soon"))

})

export { googleAuthController, emailSignUp, emailLogin, updatePhone, updateAddress, checkPincode }
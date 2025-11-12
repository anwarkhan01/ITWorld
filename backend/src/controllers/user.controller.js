import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const googleAuthController = asyncHandler(async (req, res, next) => {
    const { uid, email, name, picture } = req.user
    let user = await User.findOne({
        $or: [{ firebaseUid: uid }, { email }],
    });

    if (user) {
        user.firebaseUid = uid;
        user.name = name || user.name;
        user.photoURL = picture || user.photoURL;
        user.authProvider = "google";
        user.emailVerified = true;
        await user.save();
    } else {
        user = await User.create({
            firebaseUid: uid,
            name: name || "User",
            photoURL: picture || "",
            authProvider: "google",
            emailVerified: true,
            email,
        });
    }

    const createdAt = Math.floor(new Date(user.createdAt).getTime() / 1000);
    const updatedAt = Math.floor(new Date(user.updatedAt).getTime() / 1000);
    const message =
        createdAt === updatedAt
            ? "User Created Successfully"
            : "User Updated Successfully";

    res.json(new ApiResponse(200, message, user));
});

const updatePhone = asyncHandler(async (req, res, next) => {
    const uid = req.user.uid;
    const { phone } = req.body;
    if (!phone) return next(new ApiError(400, "Phone number is required"));

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return next(new ApiError(400, "Invalid phone number format"));
    }

    const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $set: { phone: phone } },
        { new: true, runValidators: true }
    );

    if (!user) return next(new ApiError(404, "User not found"));

    return res.json(new ApiResponse(200, "Phone number updated successfully", user));
});

const updateAddress = asyncHandler(async (req, res, next) => {
    const uid = req.user.uid;
    const { address } = req.body;
    if (!address) return next(new ApiError(400, "Address object is required"));

    if (address.pincode !== undefined) {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(address.pincode)) {
            return next(new ApiError(400, "Invalid pincode format"));
        }
    }

    const updateFields = {};
    if (address.fullAddress !== undefined)
        updateFields["address.fullAddress"] = address.fullAddress.trim();
    if (address.landmark !== undefined)
        updateFields["address.landmark"] = address.landmark.trim();
    if (address.city !== undefined)
        updateFields["address.city"] = address.city.trim();
    if (address.state !== undefined)
        updateFields["address.state"] = address.state.trim();
    if (address.country !== undefined)
        updateFields["address.country"] = address.country.trim();
    if (address.pincode !== undefined)
        updateFields["address.pincode"] = address.pincode.trim();

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

const emailSync = asyncHandler(async (req, res, next) => {
    const { uid, email: decodedEmail } = req.user;
    const { uid: bodyUid, email, name, emailVerified } = req.body;

    const userEmail = email || decodedEmail;
    const userId = bodyUid || uid;

    let userByEmail = await User.findOne({ email: userEmail });

    if (userByEmail) {
        userByEmail.firebaseUid = userId;
        userByEmail.name = name || userByEmail.name;
        userByEmail.emailVerified = emailVerified ?? decodedToken.email_verified ?? false;
        await userByEmail.save();
        return res.json(new ApiResponse(200, "Email user synced successfully", userByEmail));
    }

    const newUser = await User.create({
        firebaseUid: userId,
        email: userEmail,
        name: name || userEmail.split('@')[0],
        authProvider: 'email',
        emailVerified: emailVerified ?? decodedToken.email_verified ?? false
    });
    return res.json(new ApiResponse(200, "Email user synced successfully", newUser));
});

// * TODO: implement pincode deliverability check
const checkPincode = asyncHandler((req, res, next) => {
    res.json(new ApiResponse(300, "We will implement this soon"))

})

export {
    googleAuthController,
    updatePhone,
    updateAddress,
    checkPincode,
    emailSync
}
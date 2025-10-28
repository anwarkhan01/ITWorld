import express from "express";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const router = express.Router()

router.get("/verify-user", async (req, res) => {
    let user = await User.findById(req.user.uid);
    if (!user) {
        user = await User.create({
            _id: req.user.uid,
            name: req.user.name,
            email: req.user.email,
            photoURL: req.user.picture
        });
    }
    res.json(new ApiResponse(200, user, "User Account Created Successfully"));
})

router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email: email,
                name: name || email.split('@')[0],
                photoURL: picture,
                authProvider: 'google',
                emailVerified: true
            });
        } else {
            // Update user info
            user.name = name || user.name;
            user.photoURL = picture || user.photoURL;
            user.lastLogin = new Date();
            await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

router.post('/email', async (req, res) => {
    try {
        const { token, name, email, photoURL } = req.body;

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email: firebaseEmail, email_verified } = decodedToken;

        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email: email || firebaseEmail,
                name: name || email?.split('@')[0] || 'User',
                photoURL: photoURL,
                authProvider: 'email',
                emailVerified: email_verified
            });
        } else {
            // Update user info
            user.name = name || user.name;
            user.emailVerified = email_verified;
            user.lastLogin = new Date();
            await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Email auth error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

router.post('/phone', async (req, res) => {
    try {
        const { token, name, phone, photoURL } = req.body;

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, phone_number } = decodedToken;

        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                phone: phone || phone_number,
                name: name || 'User',
                photoURL: photoURL,
                authProvider: 'phone',
                phoneVerified: true
            });
        } else {
            // Update user info
            user.name = name || user.name;
            user.phone = phone || phone_number || user.phone;
            user.phoneVerified = true;
            user.lastLogin = new Date();
            await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Phone auth error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

export default router;
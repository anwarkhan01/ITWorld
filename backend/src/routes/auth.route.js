import express from "express";
import admin from "../config/firebase.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;

        // verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, name, email } = decodedToken;

        let user = await User.findOne({ uid });
        if (!user) {
            user = await User.create({
                uid,
                name: decodedToken.name || "Unnamed User",
                email: decodedToken.email,
            });

            await Cart.create({ userId: user._id, items: [] });
        }

        const cart = await Cart.findOne({ userId: user._id });
        res.json({ user, cart });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Authentication failed" });
    }
});

export default router;

import express from "express";
import Cart from "../models/cart.model.js";
import { getAuth } from "firebase-admin/auth";

const router = express.Router();


const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = await getAuth().verifyIdToken(token);
        req.userId = decoded.uid;

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

router.get("/get-cart", authenticate, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId }).lean();
        console.log("cart", cart)
        res.json(cart || { items: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/update-cart", authenticate, async (req, res) => {
    try {
        const { cart } = req.body; // [{id, quantity}]
        if (!Array.isArray(cart)) return res.status(400).json({ message: "Invalid cart" });

        const items = cart.map((i) => ({ productId: i.id, quantity: i.quantity }));

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.userId },
            { items },
            { new: true, upsert: true }
        );

        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;

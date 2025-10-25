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

export default router;
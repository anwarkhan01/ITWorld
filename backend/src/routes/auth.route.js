import express from "express";
import {
    googleAuthController,
    updateAddress,
    updatePhone,
    checkPincode,
    emailSync
} from "../controllers/user.controller.js";
import verifyIdToken from "../middlewares/verifyToken.middleware.js";

const router = express.Router();
router.post("/google-auth", verifyIdToken, googleAuthController)
router.post('/email-sync', verifyIdToken, emailSync)
router.put("/update-phone", verifyIdToken, updatePhone)
router.put("/update-address", verifyIdToken, updateAddress)
router.post("/check-pincode", verifyIdToken, checkPincode)

export default router;

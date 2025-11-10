import express from "express";
import {
    googleAuthController,
    updateAddress,
    updatePhone,
    checkPincode,
    emailSync
} from "../controllers/user.controller.js";

const router = express.Router();
router.post("/google-auth", googleAuthController)
router.post('/email-sync', emailSync)
router.put("/update-phone", updatePhone)
router.put("/update-address", updateAddress)
router.post("/check-pincode", checkPincode)

export default router;

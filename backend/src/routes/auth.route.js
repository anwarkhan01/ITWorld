import express from "express";
import { emailLogin, emailSignUp, googleAuthController, updateAddress, updatePhone, checkPincode } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/google-auth", googleAuthController)
router.post("/email-signup", emailSignUp)
router.post('/email-login', emailLogin);

router.put("/update-phone", updatePhone)
router.put("/update-address", updateAddress)
router.post("/check-pincode", checkPincode)

export default router;

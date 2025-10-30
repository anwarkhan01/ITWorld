import express from "express";
import { emailLogin, emailSignUp, googleAuthController } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/google-auth", googleAuthController)
router.post("/email-signup", emailSignUp)
router.post('/email-login', emailLogin);

export default router;

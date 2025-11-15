import express from "express";
import { startPayU, payuSuccess, payuFailure } from "../controllers/payment.controller.js";
import verifyIdToken from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post("/start-payu", verifyIdToken, startPayU);          // user begins online payment
router.post("/success/:txnid", payuSuccess); // PayU success callback
router.post("/failure/:txnid", payuFailure); // PayU failure callback

export default router;

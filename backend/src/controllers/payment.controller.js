import { payuClient, CreateTransaction } from "../config/payu.js";
import { randomBytes } from "crypto";
import crypto from "crypto"; // Add this import
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/**
 * Step 1 — User begins online payment
 * No order is created here
 */
const startPayU = asyncHandler(async (req, res) => {
  const { productData, shipping } = req.body;
  const { email, uid } = req.user;
  const txnid = "PAYU_" + Math.floor(Math.random() * 45825666);

  const paymentData = await CreateTransaction({
    txnid: txnid,
    amount: productData.totalPrice,
    productInfo: `Order for ${productData.products.length} items`,
    firstName: shipping.name,
    email: email,
    phone: shipping.phone,
    udf1: uid,
    udf2: JSON.stringify(shipping),
    udf3: JSON.stringify(productData),
  });

  const nonce = randomBytes(16).toString("base64");

  res.setHeader(
    "Content-Security-Policy",
    `script-src 'self' 'nonce-${nonce}' https://test.payu.in https://secure.payu.in;`
  );

  const patchedHtml = paymentData.replace(
    /<script[^>]*>/i,
    `<script nonce="${nonce}">`
  );

  res.send(patchedHtml);
});

/**
 * Step 2 — PayU success → now create the order
 */
const payuSuccess = asyncHandler(async (req, res) => {
  console.log("payment successful");
  const txnid = req.params.txnid;

  try {
    const verify = await payuClient.verifyPayment(txnid);
    const info = verify.transaction_details[txnid];

    if (!info || info.status !== "success") {
      console.log("Payment verification failed or status not success");
      return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-failed`);
    }

    console.log("Payment info:", info);

    // Generate custom orderId
    const orderId = [...crypto.getRandomValues(new Uint8Array(12))]
      .map((b) => b.toString(36).padStart(2, "0"))
      .join("")
      .slice(0, 20)
      .toUpperCase();

    // Parse stored data from UDF fields
    const productData = JSON.parse(info.udf3);
    const shipping = JSON.parse(info.udf2);
    const firebaseUid = info.udf1;

    // Create order in database
    const order = await Order.create({
      firebaseUid: firebaseUid,
      useremail: info.email,
      productData,
      shipping,
      orderId: orderId, // Custom order ID
      paymentMethod: "payu",
      orderToken: txnid, // PayU transaction ID
      paymentId: info.mihpayid, // PayU payment ID
      status: "Processing",
      meta: { createdAt: new Date(), fromBuyNow: false },
    });

    console.log("Order created:", order.orderId);

    // Redirect to order details page using custom orderId
    return res.redirect(`${process.env.FRONTEND_URL}/orders/${order.orderId}`);
  } catch (error) {
    console.error("PayU success handler error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-failed`);
  }
});

/**
 * Step 3 — PayU failure
 */
const payuFailure = asyncHandler(async (req, res) => {
  console.log("Payment failed");
  return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-failed`);
});

export { startPayU, payuSuccess, payuFailure };
import { payuClient, CreateTransaction } from "../config/payu.js";
import { randomBytes } from "crypto";
import crypto from "crypto";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const cache = new Map();

const startPayU = asyncHandler(async (req, res) => {
  const { productData, shipping } = req.body;
  const { email, uid } = req.user;

  const txnid = "PAYU_" + Math.floor(Math.random() * 45825666);

  // store productData in cache
  const ref = crypto.randomBytes(8).toString("hex");
  cache.set(ref, { productData, shipping, uid });

  setTimeout(() => cache.delete(ref), 10 * 60 * 1000);

  const paymentData = await CreateTransaction({
    txnid,
    amount: productData.totalPrice,
    productInfo: `Order for ${productData.products.length} items`,
    firstName: shipping.name,
    email,
    phone: shipping.phone,
    udf1: ref,
    udf2: "",
    udf3: "",
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

const payuSuccess = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const txnid = req.body.txnid;

  const verify = await payuClient.verifyPayment(txnid);
  const info = verify.transaction_details[txnid];

  if (!info || info.status !== "success") {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-failed`);
  }

  const ref = info.udf1;
  const cached = cache.get(ref);

  if (!cached) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-failed`);
  }

  const { productData, shipping, uid } = cached;

  const orderId =
    crypto.randomBytes(12).toString("hex").substring(0, 20).toUpperCase();

  const order = await Order.create({
    firebaseUid: uid,
    useremail: email,
    productData,
    shipping,
    orderId,
    paymentMethod: "payu",
    orderToken: txnid,
    paymentId: info.mihpayid,
    status: "processing",
    meta: { createdAt: new Date(), fromBuyNow: false },
  });

  return res.redirect(`${process.env.FRONTEND_URL}/orders/${order.orderId}`);
});


const payuFailure = asyncHandler(async (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-failed`);
});

export { startPayU, payuSuccess, payuFailure };

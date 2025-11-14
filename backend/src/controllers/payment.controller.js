import { payuClient, CreateTransaction } from "../config/payu.js";
import { randomBytes } from "crypto";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js"

/**
 * Step 1 — User begins online payment
 * No order is created here
 */
const startPayU = asyncHandler(async (req, res) => {
  const { productData, shipping, user } = req.body;
  const txnid = "PAYU_" + Math.floor(Math.random() * 45825666);
  const paymentData = await CreateTransaction({
    txnid: txnid,
    amount: productData.totalPrice,
    productInfo: `Order for ${productData.products.length} items`,
    firstName: shipping.name,
    email: user.email,
    phone: shipping.phone,
    udf1: user.firebaseUid,
    udf2: JSON.stringify(shipping),
    udf3: JSON.stringify(productData)
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
})


/**
 * Step 2 — PayU success → now create the order
 */
const payuSuccess = asyncHandler(async (req, res) => {
  console.log("payment successful")
  const txnid = req.params.txnid;

  const verify = await payuClient.verifyPayment(txnid);
  const info = verify.transaction_details[txnid];

  if (!info || info.status !== "success") {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/payment-success`);
  }

  console.log("info................", info)
  // Reconstruct original data
  console.log("Udf3", info.udf3)
  const productData = JSON.parse(info.udf3)
  const shipping = JSON.parse(info.udf2);

  const order = await Order.create({
    firebaseUid: info.udf1,
    useremail: info.email,
    productData,
    shipping,
    paymentMethod: "payu",
    orderToken: txnid,
    paymentId: info.mihpayid,
    status: "Processing",
    meta: { createdAt: new Date(), fromBuyNow: false },
  });

  return res.redirect(`${process.env.FRONTEND_URL}/orders/${order._id}`);
})


/**
 * Step 3 — PayU failure
 */
const payuFailure = asyncHandler(async (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/cart`);
})



export { startPayU, payuSuccess, payuFailure }



































// import asyncHandler from "../utils/asyncHandler.js";
// import { payuClient, CreateTransaction } from "../config/payu.js";
// import { randomBytes } from "crypto";

// const getPayment = asyncHandler(async (req, res) => {
//   const paymentData = await CreateTransaction({
//     amount: 899,
//     productInfo: { "name": "Test Product", "price": 899 },
//     firstName: "John Doe",
//     email: "anwarkhan84088@gmail.com",
//     phone: 8408852662,
//     udf1: "udf1",
//     udf2: "udf2",
//     udf3: "udf3",
//     udf4: "udf4",
//     udf5: "udf5",
//   });

//   // Generate nonce
//   const nonce = randomBytes(16).toString("base64");

//   // Set CSP with nonce
//   res.setHeader(
//     "Content-Security-Policy",
//     `script-src 'self' 'nonce-${nonce}' https://test.payu.in https://secure.payu.in https://info.payu.in; frame-src 'self' https://test.payu.in https://secure.payu.in;`
//   );

//   // Inject nonce into PayU's HTML response
//   // const modifiedHTML = paymentData.replace(
//   //   /<script>/g,
//   //   `<script nonce="${nonce}">`
//   // );

//   const patchedHtml = paymentData.replace(
//     /<script[^>]*>/i,
//     `<script nonce="${nonce}">`
//   );
//   res.send(patchedHtml);
// });

// export { getPayment };

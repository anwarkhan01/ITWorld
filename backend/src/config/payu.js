import PayU from "payu-websdk";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";

const payuClient = new PayU({
    key: process.env.PAYU_KEY,
    salt: process.env.PAYU_SALT,
}, "TEST");

const CreateTransaction = async ({
    txnid,
    amount,
    productInfo,
    firstName,
    email,
    phone,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
}) => {

    console.log("udf1", udf1)
    console.log("udf2", udf2)
    console.log("udf3", udf3)
    console.log("udf4", udf4)
    console.log("udf5", udf5)
    const hashString =
        `${process.env.PAYU_KEY}|${txnid}|${amount}|${productInfo}|${firstName}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|||||||||||${process.env.PAYU_SALT}`;

    const hashValue = crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");

    return payuClient.paymentInitiate({
        amount,
        firstname: firstName,
        email,
        phone,
        txnid,
        productinfo: productInfo,
        surl: `http://localhost:8000/api/payment/success/${txnid}`,
        furl: `http://localhost:8000/api/payment/failure/${txnid}`,
        hash: hashValue,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
    });
}

export { payuClient, CreateTransaction }

























// // const PayU = require("payu");
// import PayU from "payu-websdk";
// import crypto from "crypto";


// const payuClient = new PayU({
//     key: `${process.env.PAYU_KEY}`,
//     salt: `${process.env.PAYU_SALT}`,
// }, "TEST");

// const transaction_id = "PAYU_MONEY_" + Math.floor(Math.random() * 1000000000);


// const CreateTransaction = async ({
//     txnid = transaction_id,
//     amount,
//     productInfo,
//     firstName,
//     email,
//     phone,
//     udf1,
//     udf2 = '',
//     udf3 = '',
//     udf4 = '',
//     udf5 = '',
// }) => {

//     const hash = crypto.createHash("sha512");

//     const hashString = `${process.env.PAYU_KEY}|${txnid}|${amount}|${productInfo}|${firstName}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|||||||||||${process.env.PAYU_SALT}`;

//     console.log("HASH STRING:", hashString);

//     const hashValue = hash.update(hashString).digest("hex");

//     console.log(hashValue)

//     const data = await payuClient.paymentInitiate({
//         isAmountFilledByCustomer: false,
//         amount: amount,
//         firstname: firstName,
//         email: email,
//         phone: phone,
//         txnid: txnid,
//         productinfo: JSON.stringify(productInfo),
//         surl: `http://localhost:8000/api/success/${txnid}`,
//         furl: `http://localhost:8000/api/failure/${txnid}`,
//         hash: hashValue
//     });

//     return data
// }
// export { payuClient, CreateTransaction }
const Razorpay = require("razorpay");
require("dotenv").config();

exports.instance = new Razorpay({
    key_id: process.env.RAZERPAY_KEY,
    key_secret: process.env.RAZERPAY_SECRET,
});
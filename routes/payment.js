const express = require('express');

const { isLoggedIn, customRole } = require('../middlewares/user');
const { sendRazorpayKey, sendStripeKey, captureRazorpayPayment, captureStripePayment } = require('../controller/paymentController');
const router = express.Router();

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/stripekey").get(isLoggedIn, sendRazorpayKey);

router.route("/capturestripe").post(isLoggedIn, captureStripePayment);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
// const nanoid = require('nanoid');
const BigPromise = require('../middlewares/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = BigPromise(async (req, res, next)=>{
    res.status(200).json({
        stripe_key: process.env.STRIPE_API_KEY
    });
});

exports.captureStripePayment = BigPromise(async (req, res, next)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        // payment_method_types: ['card']

        //optional
        metadata: {integration_check: 'accept_a_payment'}
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        //you can optionally send ID as well
    })
});


exports.sendRazorpayKey = BigPromise(async (erq, res, next)=>{
    res.status(200).json({
        razorpay_key: process.env.RAZORPAY_API_KEY
    });
});

exports.captureRazorpayPayment = BigPromise(async (erq, res, next)=>{
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_API_SECRET });

    var options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: nanoid.nanoid(),  //generate a random string
        // notes: {
        //     key1: "value3",
        //     key2: "value2"
        // }
    };

    const myOrder = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    });
});


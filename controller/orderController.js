const User = require('../models/user');
const Product = require('../models/product');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');
const WhereClause = require('../utils/whereClause');
const Order = require('../models/order');

exports.createOrder = BigPromise(async (req, res, next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        order
    });

});

exports.getOneOrder = BigPromise(async (req, res, next)=>{
    const order = await Order.findById(req.params.id).populate('user', 'name email');   //helps expand "REF" values which refer to pther tables, use "SPACE" to mention the fields which are needed

    if(!order)
        return next(new CustomError("please check order id", 401));

    res.status(200).json({
        success: true,
        order
    });
});

exports.getLoggedInOrders = BigPromise(async (req, res, next)=>{
    const order = await Order.find({user: req.user._id});

    if(!order)
        return next(new CustomError("please check order id", 401));

    res.status(200).json({
        success: true,
        order
    });
});


exports.adminGetAllOrders = BigPromise(async (req, res, next)=>{
    const orders = await Order.find(); //full table

    res.status(200).json({
        success: true,
        orders
    });
});


//changing order status, if delivered-> change PRODUCT qty of item-1
exports.adminUpdateOrder = BigPromise(async (req, res, next)=>{
    const order = await Order.findById(req.params.id); //full table

    if(order.orderStatus === "Delivered")
        return next(new CustomError("Order is already marked for delivered"));

    order.orderStatus = req.body.orderStatus;
    order.orderItems.forEach(async prod =>{
        updateProductStock(prod.product, prod.quantity);
    });

    await order.save();

    res.status(200).json({
        success: true,
        orders
    });
});

async function updateProductStock(productId, qty){
    const product = await Product.findById(productId);

    //NOT IMPLEMENTED YET -> check if the orderQuantity is more than the Qty in inventory
    product.stock = product.stock - qty;
    await product.save({validateBeforeSave: false});
}

exports.adminDeleteOrder = BigPromise(async (req, res, next)=>{
    const order = await Order.findById(req.params.id);

    if(!order)
        return next(CustomError('Order not found'));

    await order.deleteOne({_id: req.params.id});

    res.status(200).json({
        success: true,
        message:"order deleted successfully"
    });
});
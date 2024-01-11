const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next)=>{
    const token = req.cookies.token || req.header("Authorization") && req.header("Authorization").replace('Brearer ','');

    if(!token)
        return next(new CustomError('Login first to access this page', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.id);
    req.user = await User.findById(decoded.id);   //using the middleware, we have injected one more property "user" (we can call it "superman" if we want), this can be accessed anywhere now
    next();
});


//since we are spreading it (...roles), admin string passed from routes will get added to routes array.
//and from req.user.role, we will get role from database
exports.customRole = (...roles)=>{      //converting parameter to array
    return (req, res, next)=>{
        if(!roles.includes(req.user.role))
            return next(new CustomError('You are not allowed for this resource', 403));
        next();
    };
};
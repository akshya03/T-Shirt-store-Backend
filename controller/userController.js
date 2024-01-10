const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');

exports.signup = BigPromise(async (req, res, next)=>{
    // res.send('signup route')

    //REFACTORING / RESTRUCTRING / REVAMPING
    // let result;     //this will hold the ID and secure URL if file/image is found in request body

    //checker for user images/files
    // if(req.files){
    //     let file = req.files.photo;  //this needs to be conveyed to frontend that variable used is "photo"
    //     console.log(`file:${file}`);
    //     console.log(`file.tempFilePath:`, file.tempFilePath);
    //     result = await cloudinary.v2.uploader.upload(file.tempFilePath, {      //FILE PATH is uploaded and not directly the file
    //         folder: "users",
    //         width: 150,
    //         crop: "scale"   //scale/fit/stretch
    //     });
    //     // }).then(result=>console.log(result)).catch(result=>console.log(result));
    // }
    // REFACTORING THIS CODE with custom error messages

    if(!req.files)
        return next(new CustomError("photo is required for signup", 400));

    const {name, email, password} = req.body;

    if(!(email && name && password)){
        // return next(new Error('Please send email'));
        return next(new CustomError('Name, email and password are required', 400));
    }

    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale"
    });

    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next)=>{
    console.log('Login route');
    const {email, password} = req.body;

    if(!(email && password))
        return next(new CustomError('Please provide both email and password', 400));

    //get user from DB
    const user = await User.findOne({email}).select("+password");  // this will ask DB to also send the password since we wrote: "select: false" in the model

    //if user is not found in DB
    if(!user)
        return next(new CustomError('Email or password does not match or exist', 400));
    console.log(`Username:${user.name} `);
    //match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);
    //if password do not match
    if(!isPasswordCorrect)
        return next(new CustomError('You are not registered in our database', 400));

    //if all goes good, we send the token
    cookieToken(user, res);
    
});

exports.logout = BigPromise(async (req, res, next)=>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "Logout success"
    });
});
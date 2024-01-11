const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');

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

exports.forgotPassword = BigPromise(async (req, res, next)=>{
    const {email} = req.body;

    const user = await User.findOne({email});
    if(!user)
        return next(new CustomError('Email not found as registered', 400));

    const forgotToken = user.getForgotPasswordToken();

    await user.save({validateBeforeSave: false});     //this will temporarily not check the data and save it as it is
    
    //now forgotToken needs to ben sent to the user but the user does not know which URL to hit
    //crafting a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    //sending an email might create many errors and failures
    try {
        await mailHelper({
            email: user.email,
            subject: "LCO T-shirt store -->Password reset email",
            message
        });
        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });

    } catch (error) {
        //since email is not sent, these fields need to be emptied/flushed out
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({validateBeforeSave: false});

        return next(new CustomError(error.message), 500);
    }

});

exports.passwordReset = BigPromise(async (req, res, next)=>{
    const token = req.params.token;

    const encryToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        forgotPasswordToken: encryToken,
        forgotPasswordExpiry: {$gt: Date.now()}  //$gt->greater than, DB token time should be in the future or it has expired
    });
    if(!user)
        return next(new CustomError('Token is invalid or expired', 400));

    if(req.body.password !== req.body.confirmPassword)
        return next(new CustomError('password and confirm password do not match', 400));

    user.password = req.body.password;
    forgotPasswordToken = undefined;
    forgotPasswordExpiry = undefined;
    await user.save();

    //send a JSON response OR send a token

    cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next)=>{
    console.log(req.user.id);
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});
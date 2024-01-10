const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

exports.signup = BigPromise(async (req, res, next)=>{
    // res.send('signup route')
    let result;     //this will hold the ID and secure URL if file/image is found in request body

    //checker for user images/files
    if(req.files){
        let file = req.files.photo  //this needs to be conveyed to frontend that variable used is "photo"
        result = await cloudinary.uploader.upload(file, {
            folder: "users",
            width: 150,
            crop: "scale"   //scale/fit/stretch
        });
    }



    const {name, email, password} = req.body;

    if(!(email && name && password)){
        // return next(new Error('Please send email'));
        return next(new CustomError('Name, email and password are required', 400));
    }

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
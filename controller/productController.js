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

exports.testProduct = async(req, res)=>{
    console.log(req.query); // as you can see, this formats the mongodb query operators just as needed, we just need to add $ sign to lte|gte
    res.status(200).json({
        success: true,
        greeting: "this is test for product"
    });

};

exports.addProduct = BigPromise(async (req, res, next)=>{
    //images

    let imageArray = [];

    if(!req.files)
        return next(new CustomError('images are required'));

    for(let index = 0; index<req.files.photos.length; ++index){
        let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
            folder: "products"
        });

        imageArray.push({
            id: result.public_id,
            secure_url: result.secure_url
        });
    }

    //overwriting the photos property in req body
    req.body.photos = imageArray;
    req.body.user = req.user.id;    // req.user.id is set by isLoggedIn middleware
    
    const product = await Product.create(req.body);

     //need to take care of a catch() case where the images are uploaded on cloud the data is not stored in DB due to some error
     // we will need to images on cloudinary
    //  const resp = await cloudinary.v2.uploader.destroy(imageId);

    res.status(200).json({
        success: true,
        product
    });

});

exports.getAllProduct = BigPromise(async (req, res, next)=>{

    const resultPerPage = 6;

    const totalCountProduct = await Product.countDocuments();

    const productsObj = new WhereClause(Product.find(), req.query).search().filter();

    let products = await productsObj.base;
    const filteredProductNumber = products.length;

    // products.limit().skip();  //instead, use the method of object .pager()

    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();      //mongoose query cannot be executed twice, use .clone() to bypass it

    res.status(200).json({
        success: true,
        products,
        filteredProductNumber,
        totalCountProduct
    });
});

exports.getOneProduct = BigPromise(async(req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
        return next(new CustomError("No product found with this id", 401));
    
    res.status(200).json({
        success: true,
        product
    });
});

//ADMIN ONLY CONTROLLERS

exports.adminGetAllProduct = BigPromise(async (req, res, next)=>{
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next)=>{
    let product = await Product.findById(req.params.id);

    if(!product)
        return next(new CustomError("no product found with this id"));

    let imagesArray = [];

    if(req.files){
        //destroy the existing images
        for (let index = 0; index < product.photos.length; index++) {
            // const element = product.photos[index];
            const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
        }

        //upload and save the images
        for(let index = 0; index<req.files.photos.length; ++index){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products"      //folder name -> .env
            });
    
            imagesArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
        
        product = await Product.create(req.body);
        req.body.photos = imagesArray;
    }

    

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        userFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
        return next(new CustomError("no product found with this id"));

    //deleting images from Cloudinary
    for (let index = 0; index < product.photos.length; index++) {
        // const element = product.photos[index];
        await cloudinary.v2.uploader.destroy(product.photos[index].id);
    }

    //DB operation
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Product was deleted!"
    });
});
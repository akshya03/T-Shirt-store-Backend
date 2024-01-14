const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide product name'],
        trim: true,
        maxLength: [120, 'Product name should not be more than 120 words']
    },
    price: {
        type: Number,
        required: [true, 'please provide product price'],
        maxLength: [6, 'Product price should not be more than 6 digits']
    },
    description: {
        type: String,
        required: [true, 'please provide product description'],
    },
    photos: [
        {
            id:{
                type: String,
                required: true
            },
            secure_url:{
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'please select category from: short-sleeves, long-sleeves, sweat-shirts, hoodies'],
        enum:{      //restrict user options to select
            values:[        //enum values should not have dashes due to encoding issues
                'shortSleeves',
                'longSleeves',
                'sweatShirts',
                'hoodies'
            ],
            message: 'Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies'
        }
    },
    stock:{
        type: Number,
        required: [true, 'please add a no. in stock']
    },
    brand: {
        type: String,
        required: [true, 'please add a brand for clothing']
    },
    ratings:{
        type: Number,
        default: 0
    },
    numberOfReviews:{
        type: Number,
        default: 0
    },
    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment: String
        }
    ],
    user:{      //to see who is the logged in user who created this field
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        // default: ()=>{
        //     let date = new Date();
        //     let newDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000 * -1));
        //     return newDate;
        // }
    }
// },{
//     timestamps: true
// }
});



module.exports = mongoose.model("Product", productSchema);
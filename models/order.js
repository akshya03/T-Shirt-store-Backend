const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        address:{
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        phoneNo:{
            type: Number,
            required: true
        },
        postalCode:{
            type: String,
            required: true
        },
        state:{
            type: String,
            required: true
        },
        country:{
            type: String,
            required: true
        },
    },
    user:{
        type: mongoose.Schema.ObjectId,      //same as mongoose.Schema.Types.ObjectId
        ref: 'User',
        required: true
    },
    orderItems:[
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            
        }
    ],
    paymentInfo:{
        id: String
    },
    taxAmount:{
        type: Number,
        required: true
    },
    shippingAmount:{
        type: Number,
        required: true
    },
    totalAmount:{
        type: Number,
        required: true
    },
    orderStatus:{
        type: String,
        default: "processing",
        required: true
    },
    deliveredOn: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Order', orderSchema);
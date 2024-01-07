const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    // name:String,         //this also works
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxLength: [40, 'Name should be under 40 characters']
    },
    email:{
        type: String,
        required: [true, 'Please provide an email'],
        validator: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [6, 'password should be atleast 6 char'],
        select: false       
        // this will help NOT RETURN the password field when queried. To get this field when queried from DB, it should be mentioned explicitly
        // this is a replacement for user.password = undefined when returning the response.
    },
    role:{
        type: String,
        default: 'user'
    },
    photo:{
        id:{
            type: String,
            required: true
        },
        secure_url:{
            type: String,
            required: true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt:{
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema);
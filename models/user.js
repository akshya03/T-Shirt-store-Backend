const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
        },
        secure_url:{
            type: String,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt:{
        type: Date,
        default: Date.now,
    }
});


//encrypt password before save - HOOKS
userSchema.pre('save', async function(next){
    // this.password = await bcrypt.hash(this.password, 10);  //this will re-encrypt the password everytime save() is called->even if updating any other field
    //to avoid this
    //this will work only when PASSWORD is changed ->new, forgot password
    if(!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
});

//validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function(userSendPassword){
    console.log(this.password, userSendPassword);
    // const r = await bcrypt.compare(this.password, userSendPassword);
    // console.log(`r:${r}`);
    return await bcrypt.compare(userSendPassword, this.password);
}

//create and return JWT token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRY
        });
};

//generate forgot password token(string)
userSchema.methods.getForgotPasswordToken = function(){
    //generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString('hex');

    //this is already a secure string
    //hashing it further
    //getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

    //  ..time of token
    this.forgotPasswordExpiry = Date.now() + 20*60*1000;  //20 mins

    return forgotToken;
}

module.exports = mongoose.model('User', userSchema);

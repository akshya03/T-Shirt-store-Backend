const express = require('express');
require('dotenv').config();
var morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');


const app = express();

//regular middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir:"/tmp/"
}));

//temp check
app.set("view engine", "ejs");

//morgan middleware
app.use(morgan('tiny'));

//import all routes here
const home = require('./routes/home');
const user = require("./routes/user");

//router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);

//test route
app.get('/signuptest', (req, res)=>{
    res.render("signuptest");
})

module.exports = app;
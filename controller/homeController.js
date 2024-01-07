//to implement async-await (try catch) OR (use promise)
const BigPromise = require('../middlewares/bigPromise');

//here we using Promise
exports.home = BigPromise(async(req, res)=>{
    //const db = AWAIT something()
    res.status(200).json({
        success: true,
        greeting: "Hello from API",
    });
});

//here we using try and catch
exports.homeDummy = async(req, res)=>{
    try{
        //const db = AWAIT something()
        res.status(200).json({
            success: true,
            greeting: "this is another dummy route"
        });
    }catch(error){
        console.log(error);
    }
};
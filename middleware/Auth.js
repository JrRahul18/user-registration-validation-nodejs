const ErrorHandler = require("../utils/ErrorHandler")
const CatchAsyncError = require("../middleware/CatchAsyncError")
const jwtToken = require("jsonwebtoken")
const User = require("../model/UserModel")

exports.isAuthenticated = CatchAsyncError(async (req, res, next) =>{
    const extractToken = req.cookies;
    console.log("User Token", extractToken)
    if(!extractToken.token){
        return next(new ErrorHandler("Please Login to access this resource!", 401));
    }
    const data = jwtToken.verify(extractToken.token, process.env.JWT_SECRET)
    req.user = await User.findById(data.id);
    next();

})
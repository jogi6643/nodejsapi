const ErrorHandler = require("../utils/errorhandler");
const trycatchError = require("./trycatchError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
exports.isAuthenticatedUser = trycatchError( async(req,res,next)=>{
    const {token} =req.cookies;
    if(!token)
    {
        return next(new ErrorHandler("Please Login to access this resource", 401))
    }
    const decodeData = jwt.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(decodeData.id);
   next();
   
});
exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        {
           return next( new ErrorHandler(`Role:${req.user.role} is not allowed to acces this resource`,403));
        }
        next();
    }
};
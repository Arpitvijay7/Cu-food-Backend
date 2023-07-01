const ErrorHandler = require("../utils/ErrorHandler")

module.exports = (err , req , res, next)=> {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "internal Server Error";

    // Wroung MongoDb id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message , 400);
    }

    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)}`
        err = new ErrorHandler(message , 400); 
    }
    
    // Wroung json web token
    if (err.name === "jsonWebTokenError") {
        const message = `json web token is invalid try again`;
        err = new ErrorHandler(message , 400); 
    }
    
    // JWT EXPIRE ERROR  
    if (err.name === "jsonWebExpiredError") {
        const message = `json web token is expired, try again`;
        err = new ErrorHandler(message , 400); 
    }
    res.status(err.statusCode).json({
        success:false,
        message: err.message,
    })
}
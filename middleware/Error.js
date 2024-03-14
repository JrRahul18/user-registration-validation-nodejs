const ErrorHandler = require("../utils/ErrorHandler");
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  console.log("Error Recieved");

    //MONGODB ID error
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      err = new ErrorHandler(message, 400);
    }
    //JWT Error
    if (err.name === "JsonWebTokenError") {
      const message = `Invalid JSON Web Token `;
      err = new ErrorHandler(message, 400);
    }
  
    //JWT expired error
    if (err.name === "TokenExpiredError") {
      const message = `Expired JSON Web Token `;
      err = new ErrorHandler(message, 400);
    }
  

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    status: "Error",
    message: err.message,
    error: err.statusCode,
  });
};

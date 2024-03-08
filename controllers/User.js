const User = require("../model/UserModel");
const CatchAsyncError = require("../middleware/CatchAsyncError");
const crypto = require("crypto");
const ErrorHandler = require("../utils/ErrorHandler");
const sendEmailFunction = require("../utils/EmailTemplate");

exports.createUser = CatchAsyncError(async (req, res, next) => {
  //Extract Username, Email and Password from body.
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  //Check if user exists with same email
  const checkUser = await User.findOne({ email: email });
  if (checkUser) {
    return res
      .status(400)
      .json({ success: false, message: "User with this email already exists" });
  }

  //Check if user exists with same username
  const checkUserNext = await User.findOne({ username: username });
  if (checkUserNext) {
    // return next(new ErrorHandler("Username already exists", 401))
    return res
      .status(400)
      .json({ success: false, message: "Username already exists" });
  }

  //After creating user, the user is logged in and token is provided to him
  const user = await User.create({ username, email, password });
  // user.save()
  const COOKIE_EXPIRE = 5;

  const token = user.getToken();
  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  return res
    .status(201)
    .cookie("token", token, options)
    .json({ success: true, user: user, message: "User logged in Successfully" });
});

exports.loginUser = CatchAsyncError(async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return next(new ErrorHandler("Invalid username or Password", 401));
  }

  //added select function since we have restricted the password in UserModel
  const user = await User.findOne({ username: username }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Username", 401));
  }
  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    return next(new ErrorHandler("Invalid Password"), 401);
  }

  //Then we will login and will provide the token.
  const COOKIE_EXPIRE = 5;

  const token = user.getToken();
  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json({ success: true, user: user, message: "User logged in Successfully" });
});

exports.logoutUser = CatchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
  });
  console.log("Userjs Controller: ABOUT TO LOGOUT");
  res.status(200).json({ success: true, message: "Logged Out Successfully" });
});

exports.postForgetPassword = CatchAsyncError(async (req, res, next) =>{
  const email = req.body.email;
  const user = await User.findOne({email: email});
  if(!user){
    return next(new ErrorHandler("User with this email not registered", 404));
  }
  const resetToken = user.resetPassword();
  console.log(`Reset Token`, resetToken);
    console.log("Entered Here")

  await user.save({validateBeforeSave: false});
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
  const messageTemplate = `Hey ${user.username}! \n\n Your Password reset token is: \n\n ${resetUrl} \n\n NOTE: If not requested, please ignore it.`;

  try {
    await sendEmailFunction({
      email: user.email,
      subject: `User Registration Password Recovery`,
      message: messageTemplate
    });
    return res.status(200).json({
      success: true, message: `Email sent to ${user.email} successfully! `
    })
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({validateBeforeSave: false});
    return next(new ErrorHandler(error.message, 500));
  }

})

exports.resetPassword = CatchAsyncError(async (req, res, next) =>{
  const extractToken = req.params.token;
  const resetPasswordToken = crypto.createHash("sha256").update(extractToken).digest("hex")
  const user = await User.findOne({resetPasswordToken: resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}});

  if(!user){
    return next(new ErrorHandler("Invalid Reset Token or Token is expired", 400))
  }
  
  if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHandler("New password does not match with confirm password", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const COOKIE_EXPIRE = 5;

  const token = user.getToken();
  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json({ success: true, user: user, message: "User logged in Successfully" });
})
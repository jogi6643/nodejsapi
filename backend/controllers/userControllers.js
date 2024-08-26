const mongoose = require("mongoose");
const User = require("../models/userModel");
const trycatchErrorHandler = require("../middleware/trycatchError");
const ErrorHandler = require("../utils/errorhandler");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
//  Register a User
exports.register = trycatchErrorHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // }); 
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "public id ",
      url: "url for profile pic",
    },
  });
  
  // const token = user.getJWToken();
  // res.status(201).json({
  //   success: true,
  //   token,
  // });
  sendToken(user, 201, res);
});

// Login a User
exports.loginuser = trycatchErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password ", 404));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email & Password", 404));
  }
  //    const isPasswordMatched =  user.comparePassword(password);
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email & Password", 401));
  }
  //    const token = user.getJWToken();
  //    res.status(200).json({
  //      success: true,
  //      token,
  //    });
  sendToken(user, 200, res);
});

// Logout User
exports.logout = trycatchErrorHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = trycatchErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Your passowrd reset token is:- \n\n ${resetPasswordUrl} \n\nIf have not requested this mail then  ,please ignore it `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Website Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    error.ResetPasswordToken = undefined;
    error.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password

exports.resetPassword = trycatchErrorHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expire",
        400
      )
    );
  }
  if (req.body.password != req.body.confirmpassword) {
    return next(new ErrorHandler("Password Does not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// get User Details
exports.getUserDetails = trycatchErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//Update Password

exports.updatePassword = trycatchErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // const isPasswordMatched =  await user.comparePassword(req.body.oldPassword);
  // console.log(user);
  // if(!isPasswordMatched)
  // {
  //     return next(new ErrorHandler("Old Password is incorrect",400));
  // }
  if (req.body.newpassword !== req.body.confirmpassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  user.password = req.body.newpassword;
  await user.save();
  sendToken(user, 200, res);
});

// Update User Profile
exports.profileUpdate = trycatchErrorHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData);
  sendToken(user, 200, res);
});
// Get All Users ----Admin
exports.getAllUsers = trycatchErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});
// Get Single Users ---Admin
exports.getSingleUser = trycatchErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not exits with this Id :${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});
//  update Role  ---Admin
exports.updateUserRole = trycatchErrorHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData);
  res.status(200).json({
    success: true,
  });
});

// DELETE USER  ---Admin
exports.deleteUser = trycatchErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

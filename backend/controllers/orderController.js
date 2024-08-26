const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const mongoose = require("mongoose");
const trycatchErrorHandler = require("../middleware/trycatchError");
const Order = require("../models/order");
var nodemailer = require("nodemailer");
exports.newOrder = trycatchErrorHandler(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});
// Get ONE ORDER
exports.getOneOder = trycatchErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }
  res.status(201).json({
    success: true,
    order,
  });
});

// get LoggedIn user Orders
exports.myorders = trycatchErrorHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    orders,
  });
});

// Get All orders --Admin

exports.getAllOrders = trycatchErrorHandler(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrder = trycatchErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = trycatchErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

exports.testemail = async (req, res, next) => {
  console.log("hvgfjsd");
  const transporter = nodemailer.createTransport({
    service: "gmail", //smtp.gmail.com  //in place of service use host...
    secure: false, //true
    port: 587, //465
    auth: {
      user: "support@ukpscnet.in",
      pass: "Ukpsc@31",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var mailoption = {
    from: "support@ukpscnet.in",
    to: "jugendra.singh@netprophetsglobal.com",
    subject: "Test Mail",
    html: "Good Morning test!",
  };
  await transporter.sendMail(mailoption, function (err, response) {
    if (err) {
      console.log(err);
    }
    console.log("Message Sent" + response);
    // smtpProtocol.close();
  });

  module.exports = transporter;
};
exports.testemailnew = async (req, res, next) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    // true for 465, false for other ports
    host: "smtp.gmail.com",
    port: 587,
    secureConnection: false,
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      // user: "sanjay.kumar@netprophetsglobal.com",
      // pass: "htenwusadcjjzhey",
      user: "support@ukpscnet.in",
      pass: "Ukpsc@31",
    },
    secure: false,
    tls: { ciphers: "SSLv3" },
    // tls: {
    //   // do not fail on invalid certs
    //   rejectUnauthorized: false,
    // },
  });

  console.log("transporter", transporter);
  var mailoption = {
    // from: "sanjay.kumar@netprophetsglobal.com",
    from: "support@ukpscnet.in",
    to: "jugendra.singh@netprophetsglobal.com",
    subject: "Test Mail",
    html: "Good Morning!",
  };

  await transporter.sendMail(mailoption, function (err, response) {
    if (err) {
      console.log(err.message);
    }
    console.log("Message Sent" + response);
    // smtpProtocol.close();
  });
};

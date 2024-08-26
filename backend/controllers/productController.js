const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const mongoose = require("mongoose");
const trycatchErrorHandler = require("../middleware/trycatchError");
const ApiFeature = require("../utils/apiFeatures");
// create Product
exports.createProduct = trycatchErrorHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// Update Product
// Description we can use  retrurnOriginal:false  to immidiate  update and its same as new:true
exports.updateProduct = trycatchErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ErrorHandler("Product not found", 404));
  let product = await Product.findById(id);

  product = await Product.findByIdAndUpdate(id, req.body, {
    // new: true,
    returnOriginal: false,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product
exports.deleteProduct = trycatchErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ErrorHandler("Product not found", 404));
  await Product.remove();
  await Product.findByIdAndRemove(id);
  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

// Featch All Products
exports.getAllProducts = trycatchErrorHandler(async (req, res) => {
  const resultPerPage = 3;
  const productsCount = await Product.countDocuments();
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .search()
    .filter();
  //   .pagination(resultPerPage);
  // const products = await apiFeature.query;
  // let filteredProductsCount = products.length;
  let products = await apiFeature.query;

  let filteredProductsCount = products.length;

  apiFeature.pagination(resultPerPage);

  products = await apiFeature.query;
  res.status(201).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});
// Featch One Product
exports.getProductDetails = trycatchErrorHandler(async (req, res, next) => {
  let id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ErrorHandler("Product not found", 404));
  let product = await Product.findById(id);
  res.status(200).json({
    success: true,
    product,
  });
});

// Reviews

exports.createReviewProduct = trycatchErrorHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product
exports.getProductReviews = trycatchErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = trycatchErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.productId.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

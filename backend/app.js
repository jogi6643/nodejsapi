const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var cors = require("cors");

const errorhandler = require("./middleware/error");

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Import Routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use(errorhandler);

module.exports = app;

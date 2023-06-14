const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error.js");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { connectPassport } = require("./utils/provider.js");
const session = require("express-session");
const cors = require("cors");

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(cors());

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.authenticate('session'))
app.use(passport.initialize());
app.use(passport.session());




connectPassport();
// Routes Imports

const Shop = require("./routes/shopRoutes");
const user = require("./routes/userRoutes");
const Food = require("./routes/foodRoutes");
const Cart = require("./routes/cartRoutes");
const Order = require("./routes/orderRoutes");

app.use("/api/vi/shop", Shop);
app.use("/api/vi/user", user);
app.use("/api/vi/food", Food);
app.use("/api/vi/cart", Cart);
app.use("/api/vi/order", Order);

app.use(errorMiddleware);

module.exports = app;

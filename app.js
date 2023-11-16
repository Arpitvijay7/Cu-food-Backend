const express = require("express");
const app = express();
const userModel = require("./models/userModel.js");

const errorMiddleware = require("./middleware/error.js");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { connectPassport } = require("./utils/provider.js");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const {
  automaticClosingOpening,
} = require("./utils/automaticClosingOpening.js");

app.set('trust proxy', true);
// const userModel = require("./models/userModel.js");
const allowedOrigins = [
  "https://cufoodz.com",
  "https://www.cufoodz.com",
   "https://vendor.cufoodz.com",
   "https://www.vendor.cufoodz.com",
];

app.use(    
  "*",
  cors({
    origin: function (origin, callback) {
      // console.log(origin);
      // if (origin === undefined) return callback(new Error("Not allowed"), false);
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// setInterval(async () => {
//   console.log('jsj');
//   let user = await userModel.deleteMany({ isVerified: false });
// }, 1000);


// app.use(
//   "*",
//   cors({
//     origin: 'https://www.cufoodz.com',
//     credentials: true,
//   })
// );

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());

connectPassport();
// Routes Imports
const Shop = require("./routes/shopRoutes");
const user = require("./routes/userRoutes");
const Food = require("./routes/foodRoutes");
const Cart = require("./routes/cartRoutes");
const Order = require("./routes/orderRoutes");
const notification = require("./routes/NotificationRoute");


app.use("/api/vi/shop", Shop);
app.use("/api/vi/user", user);
app.use("/api/vi/food", Food);
app.use("/api/vi/cart", Cart);
app.use("/api/vi/order", Order);
app.use("/api/vi/notification", notification);

app.use(errorMiddleware);

module.exports = app;

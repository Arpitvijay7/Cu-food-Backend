const express = require('express');
const app = express();
const cors=require("cors")
const errorMiddleware = require('./middleware/error.js')
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({
    extended: true,
}));
app.use(cookieParser());

// Routes Imports
const Shop = require('./routes/shopRoutes');
const user = require('./routes/userRoutes');
const Food = require('./routes/foodRoutes');
const Cart = require('./routes/cartRoutes');

app.use('/api/vi/shop',Shop)
app.use('/api/vi/user',user)
app.use('/api/vi/food',Food)
app.use('/api/vi/cart',Cart)


app.use(errorMiddleware)

module.exports = app;
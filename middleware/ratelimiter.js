const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const Orderlimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

module.exports = limiter;


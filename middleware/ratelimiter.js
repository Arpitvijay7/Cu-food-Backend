const rateLimit = require("express-rate-limit");

const SignUplimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 10, 
  message: "Too many requests from this IP, please try again after 30 minutes",
  keyGenerator: function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});

const registerlimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 10, 
  message: "Too many requests from this IP, please try again after 30 minutes",
  keyGenerator: function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});

const forgotPasswordlimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 10, 
  message: "Too many requests from this IP, please try again after 30 minutes",
  keyGenerator: function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});

const Orderlimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10, 
  message: "Too many requests from this IP, please try again after 30 minutes",
  keyGenerator: function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});

const Loginlimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10, 
  message: "Too many requests from this IP, please try again after 30 minutes",
  keyGenerator: function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});

module.exports = {SignUplimiter,registerlimiter,Orderlimiter,Loginlimiter,forgotPasswordlimiter};


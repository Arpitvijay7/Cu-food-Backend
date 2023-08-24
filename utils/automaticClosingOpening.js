const catchAsyncError = require("../middleware/catchAsyncError");
const Shop = require("../models/Shop");

exports.automaticClosingOpening = catchAsyncError(async (req, res, next) => {
  const shop = await Shop.find();
  const date = new Date();
  const time = date.getHours() + ":" + date.getMinutes();

  for (let i = 0; i < shop.length; i++) {
    if (time == shop[i].openAt) {
      shop[i].TodaysEarnings = 0;
      shop[i].TodayAcceptedOrder = [];
      shop[i].TodayRejectedOrder = [];

      await shop[i].save();
    }

    if (time > shop[i].closeAt) {

      shop[i].status = "closed";

      await shop[i].save();
    } else if (time < shop[i].openAt) {

      shop[i].status = "closed";

      await shop[i].save();
    } else {

      shop[i].status = "open";
      await shop[i].save();
    }
  }
});

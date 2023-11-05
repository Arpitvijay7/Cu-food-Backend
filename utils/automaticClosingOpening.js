const catchAsyncError = require("../middleware/catchAsyncError");
const Food = require("../models/Food");
const Shop = require("../models/Shop");

exports.automaticClosingOpening = catchAsyncError(async (req, res, next) => {
  const shop = await Shop.find();
  const date = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = hours + ":" + minutes;
  
  
  for (let i = 0; i < shop.length; i++) {
     console.log("Time:- " , time);
      console.log(shop[i].closeAt);
      console.log(shop[i].openAt);
    if (time >= shop[i].closeAt) {
      if (shop[i].status == "open") {
        shop[i].status = "closed";
        await shop[i].save();
      }
    }
    if (time >= shop[i].openAt && time < shop[i].closeAt) {
      if (shop[i].status == "closed") {
        shop[i].status = "open";

        shop[i].TodaysEarnings = 0;
        shop[i].TodayAcceptedOrder = [];
        shop[i].TodayRejectedOrder = [];

        for (let j = 0; j < shop[i].menu.length; j++) {
          let food = await Food.findById(shop[i].menu[j]);
          food.stockAvailability = true;
          await food.save();
        }

        await shop[i].save();
      }
    }
  }
});

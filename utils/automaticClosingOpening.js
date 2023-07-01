const catchAsyncError = require("../middleware/catchAsyncError");
const Shop = require("../models/Shop");

exports.automaticClosingOpening = catchAsyncError(async (req, res, next) => {
  const shop = await Shop.find();
  const date = new Date();
  const time = date.getHours() + ":" + date.getMinutes();
  console.log(time);
  for (let i = 0; i < shop.length; i++) {
    console.log(shop[i].openAt , "  " ,shop[i].closeAt , " ", time );
    if (time > shop[i].closeAt) {
      shop[i].status = "closed";
      console.log('first');
      await shop[i].save();
    } else if (time < shop[i].openAt) {
      shop[i].status = "closed";
      console.log('second');
      await shop[i].save();
    } else {
      shop[i].status = "open";
      console.log('third');
      await shop[i].save();
    }
  }
});

// how to compare two time 
// const date = new Date();
// const time = date.getHours() + ":" + date.getMinutes();
// console.log(time);
// if (time > "10:00") {
//   console.log("greater");        // greater      
// } else if (time < "10:00") {
//   console.log("smaller");
// } else {
//   console.log("equal");
// }


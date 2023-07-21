const mongoose = require("mongoose");
const { automaticClosingOpening } = require("../utils/automaticClosingOpening");

const intervalHandler = () => {
  setInterval(automaticClosingOpening, 1000);
};

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_link, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`DataBase Connected Successfully`);
      intervalHandler();
    })
    .catch((error) => {
      console.log(`Error Connecting DataBase: ${error}`);
    });
};

module.exports = connectDatabase;

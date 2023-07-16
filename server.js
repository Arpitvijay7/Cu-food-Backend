const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");

// Config Path
dotenv.config({ path: "./config/config.env" });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Handling uncaughtException Errors
process.on("uncaughtException", (err) => {
  console.log(`Error:- ${err}`);
  console.log(`Shutting down the server because of uncaught exception Errors`);
  server.close(() => {
    process.exit(1);
  });
});

connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Connected to port ${process.env.PORT}`);
});

// Handling Unhandled Rejection Errors
process.on("UnhandledRejection", (err) => {
  console.log(`Error:- ${err}`);
  console.log(`Shutting down the server because of Unhandled Rejection Errors`);
  server.close(() => {
    process.exit(1);
  });
});

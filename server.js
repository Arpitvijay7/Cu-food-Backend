const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");
const socketIO = require('socket.io');
const http = require('http')

const server = http.createServer(app);
const io = socketIO(server);

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

const port = process.env.PORT || 4000; // Use the environment variable PORT or fallback to 3001

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handling Unhandled Rejection Errors
process.on("UnhandledRejection", (err) => {
  console.log(`Error:- ${err}`);
  console.log(`Shutting down the server because of Unhandled Rejection Errors`);
  server.close(() => {
    process.exit(1);
  });
});

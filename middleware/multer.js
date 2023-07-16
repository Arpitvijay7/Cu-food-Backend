const multer = require("multer");

const storage = multer.memoryStorage();

const singleUpload = multer({storage}).single("image");

module.exports = singleUpload;
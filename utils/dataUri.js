const DataUriParser = require("datauri/parser");
const path = require("path");

exports.getdataUri = (file) =>
  new DataUriParser().format(
    path.extname(file.originalname).toString(),
    file.buffer
);

const DataUriParser = require('datauri/parser');
const path = require("path");

exports.dataUri = (file) =>
  new DataUriParser().format(
    path.extname(file.originalname).toString(),
    file.content
  );  

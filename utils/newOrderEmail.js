const nodeMailer = require("nodemailer");
const catchAsyncError = require("../middleware/catchAsyncError");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const UAParser = require("ua-parser-js");

const newOrder = catchAsyncError(async (options) => {
  const htmlContent = fs.readFileSync(
    path.join(__dirname, "..", "Assets", "newOrderhtml.txt"),
    "utf-8"
  );

  const template = handlebars.compile(htmlContent);

  const emailBody = template({
    Order_Date: options.date,
    Order_Total: options.totalPrice,
    User_Phone: options.phoneNo,
    Shop_Name: options.shopName,
  });

  const transporter = nodeMailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: process.env.SMPT_ORDER_EMAIL,
    subject: options.subject,
    html: emailBody,
  };
  await transporter.sendMail(mailOptions);
  console.log("Email Sended");
});

module.exports = newOrder;

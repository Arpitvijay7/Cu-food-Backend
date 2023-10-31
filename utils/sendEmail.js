const nodeMailer = require("nodemailer");
const catchAsyncError = require("../middleware/catchAsyncError");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const UAParser = require("ua-parser-js");

const sendEmail = catchAsyncError(async (options) => {
  const htmlContent = fs.readFileSync(
    path.join(__dirname, "resetPassword.txt"),
    "utf-8"
  );

  const VerifyhtmlContent = fs.readFileSync(
    path.join(__dirname, "verifyEmail.txt"),
    "utf-8"
  );

  const userAgent = options.req.headers["user-agent"];
  const parser = new UAParser(userAgent);
  const osInfo = parser.getOS();
  const browserInfo = parser.getBrowser();

  // Compile the HTML template using Handlebars
  const template = handlebars.compile(htmlContent);
  const Verifytemplate = handlebars.compile(VerifyhtmlContent);

  // Replace the placeholders with actual data
  const emailBody = template({
    name: options.name,
    action_url: options.resetPasswordUrl,
    support_url: "support@cufoodz.com",
    operating_system: osInfo.name || "Unkonwn OS",
    browser_name: browserInfo.name || "Unkonwn Browser",
  });

  const VerifyemailBody = Verifytemplate({
    action_url: options.verifyEmailUrl,
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
    to: options.email,
    subject: options.subject,
    html: options.type === "RESET_PASSWORD" ? emailBody : VerifyemailBody,
  };

  await transporter.sendMail(mailOptions);
});

const newOrder = catchAsyncError(async (options) => {

  const htmlContent = fs.readFileSync(
    path.join(__dirname, "newOrderhtml.txt"),
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

module.exports = sendEmail;
module.exports = newOrder;

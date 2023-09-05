const nodeMailer = require("nodemailer");
const catchAsyncError = require("../middleware/catchAsyncError");
const fs = require("fs");

const sendEmail = catchAsyncError(async (options) => {

  const htmlContent = fs.readFileSync('./resetPassword', 'utf-8');

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
    text: options.message,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}) 

module.exports = sendEmail;
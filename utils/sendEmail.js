const nodeMailer = require("nodemailer");
const catchAsyncError = require("../middleware/catchAsyncError");

const sendEmail = catchAsyncError(async (options) => {
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
  };

  await transporter.sendMail(mailOptions);
}) 

module.exports = sendEmail;
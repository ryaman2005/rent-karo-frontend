require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("Nodemailer Verify Error:", error);
    process.exit(1);
  } else {
    console.log("Server is ready to take our messages");
    process.exit(0);
  }
});

// mailer.js
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_APP,
      },
    });
    let info = await transporter.sendMail({
      from: 'www.nutromax.com',
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.log('Error sending email:', error.message);
    throw error; // Rethrow the error for the parent function to handle
  }
};

module.exports = mailSender;

const nodemailer = require('nodemailer');

const mailHelper = async (option)=>{

  //copied from docs https://nodemailer.com/about/
  const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

  const message = {
      from: 'akshya@lco.dev', // sender address
      to: option.email,
      subject: option.subject,
      text: option.message
      // html: "<b>Hello world?</b>", // html body
  }

  await transporter.sendMail(message);
};

module.exports = mailHelper;
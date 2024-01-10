const nodemailer = require('emailhelper');

const mailHelper = async ()=>{

    //copied from docs https://nodemailer.com/about/
    const transporter = nodemailer.createTransport({
        host: "smtp.forwardemail.net",
        port: 465,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: "REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM",
          pass: "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
        },
      });

    const message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: option.mail,
        subject: option.subject,
        text: option.message
        // html: "<b>Hello world?</b>", // html body
      }

    await transporter.sendMail();
};

module.exports = mailHelper;
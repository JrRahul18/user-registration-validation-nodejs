const Nodemailer = require("nodemailer");

const sendEmailFunction = async (data) => {
  const transporter = Nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVER,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: "bgjb jjpe nqyo hvdy"
    //   pass: "qreu bkhb ymlt vbcn",
    },
  });

  const mail = {
    from: process.env.SMPT_MAIL,
    to: data.email,
    subject: data.subject,
    text: data.message,
  };

  await transporter.sendMail(mail);
};
module.exports = sendEmailFunction;

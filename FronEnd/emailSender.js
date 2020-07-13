const nodemailer = require('nodemailer');

exports.SendEmail = (addressee, title, body, callback) =>
{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'selectivehoe272@gmail.com',
      pass: 'biinfkgbtdimdlgy'
    }
  })

  let result = transporter.sendMail({
    from: 'MINI Social Network',
    to: addressee,
    subject: title,
    text: body,
  }, (err, info) => {
    callback(err);
  });
}
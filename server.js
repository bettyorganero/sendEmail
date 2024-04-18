const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const { emailUser, emailPass, emailHost } = require('./config');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Load HTML template contents
const recipientEmailTemplate = fs.readFileSync('recipient-email.html', 'utf-8');
const confirmationEmailTemplate = fs.readFileSync('confirmation-email.html', 'utf-8');

const transporter = nodemailer.createTransport({
  host: emailHost, // Use host from config.js
  port: 465, // Use port 465 for secure SMTP
  secure: true, // Enable SSL/TLS
  auth: {
    user: emailUser, // Use username from config.js
    pass: emailPass // Use password from config.js
  }
});

app.post('/send-email', (req, res) => {
  const { name, lastname, company, email, subject, message } = req.body;

  // Configure email for recipient
  const recipientMailOptions = {
      from: email,
      to: 'organero@miscelaneo.net',
      subject: subject,
      html: recipientEmailTemplate.replace(/{{name}}/g, name).replace(/{{lastname}}/g, lastname).replace(/{{company}}/g, company).replace(/{{email}}/g, email).replace(/{{message}}/g, message)
  };

  // Send email to recipient
  transporter.sendMail(recipientMailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          res.status(500).send('Error sending email');
      } else {
          console.log('Email sent to recipient:', info.response);
          // Send confirmation email to sender
          const confirmationMailOptions = {
              from: 'organero@miscelaneo.net',
              to: email,
              subject: 'Confirmation: Your message has been sent successfully',
              html: confirmationEmailTemplate.replace(/{{name}}/g, name).replace(/{{lastname}}/g, lastname).replace(/{{company}}/g, company).replace(/{{email}}/g, email).replace(/{{message}}/g, message)
          };
          transporter.sendMail(confirmationMailOptions, (error, info) => {
              if (error) {
                  console.error('Error sending confirmation email:', error);
              } else {
                  console.log('Confirmation email sent:', info.response);
              }
          });
          res.status(200).send('Email sent successfully');
      }
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

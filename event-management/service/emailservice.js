const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Function to send an email using the specified mail options.
 * This function utilizes the nodemailer package to send an email via Gmail's SMTP server.
 *
 * @param {object} mailOptions - The options object containing email details such as sender, receiver, subject, and body
 *
 * Steps:
 * 1. Create a transporter object using nodemailer's `createTransport` method.
 *    - Specify the service as "gmail".
 *    - Provide authentication details (`user` and `pass`) using environment variables.
 * 2. Use the transporter to send the email with the provided `mailOptions`.
 *    - Use `await` to handle the asynchronous operation of sending the email.
 * 3. Handle any errors that occur during the email sending process.
 *    - Log the error message to the console if an error is encountered.
 *
 * This function does not return any value. It handles sending the email and logs any errors that occur.
 */
async function sendEmail(mailOptions) {
  try {
    // Create a transporter object using the Gmail SMTP server
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address from environment variables
        pass: process.env.EMAIL_PASS, // your Gmail password or app password from environment variables
      },
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    // Optionally, log info about the sent email
    console.log("Email sent: ", info.response);
  } catch (error) {
    // Log any error that occurs while sending the email
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };

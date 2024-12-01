"use server";
// import * as AWS from "aws-sdk";
// import * as nodemailer from "nodemailer";

// interface Props {
//   userEmail: string[];
//   subject: string;
//   content: string;
// }

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY1,
//   secretAccessKey: process.env.AWS_SECRET_KEY1,
//   region: "us-east-1",
// });

// AWS.config.getCredentials(function (error) {
//   if (error) {
//     console.log(error.stack);
//   }
// });

// const ses = new AWS.SES({ apiVersion: "2010-12-01" });

// const adminMail = "deepgalani126@gmail.com";

// // Create a transporter of nodemailer
// const transporter = nodemailer.createTransport({
//   SES: ses,
// });

// export const sendEmail = async ({ userEmail, subject, content }: Props) => {
//   try {
//     const response = await transporter.sendMail({
//       from: adminMail,
//       to: userEmail,
//       subject: subject,
//       html: content,
//     });

//     return response;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

import * as nodemailer from 'nodemailer';

interface Props {
  userEmail: string[];
  subject: string;
  content: string;
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // e.g., 'smtp.gmail.com'
  port: Number(process.env.SMTP_PORT), // e.g., 587 for TLS, 465 for SSL
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass:process.env.EMAIL_TEST_PWD
  }
});
  
const adminMail = process.env.EMAIL;

export const sendEmail = async ({ userEmail, subject, content }: Props) => {
  try {
    const response = await transporter.sendMail({
      from: adminMail,
      to: userEmail,
      subject: subject,
      html: content,
    });

    return response;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

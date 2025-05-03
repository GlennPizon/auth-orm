// src/utils/send-email.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const from = process.env.SMTP_USER;

export const sendEmail(to: string, subject: string, html: string, from: string):Promise<any> =>{

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });


  const info = await transporter.sendMail({
    from: `"Group-G" <${from}>`,
    to,
    subject,
    html,
  });
  
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  return info;

};



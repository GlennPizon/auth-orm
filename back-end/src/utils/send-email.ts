// src/utils/send-email.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `"Group-G" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

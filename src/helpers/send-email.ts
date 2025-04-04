import nodemailer from 'nodemailer';
import config from '../config/config.json';

const transporter = nodemailer.createTransport({
    service: config.emailConfig.service,
    auth: {
        user: config.emailConfig.auth.user,
        pass: config.emailConfig.auth.pass,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: config.emailConfig.auth.user,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
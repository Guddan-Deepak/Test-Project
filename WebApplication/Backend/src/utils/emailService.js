import { sendEmail } from "./nodeMailer.js";

export const sendVerificationEmail = async (email, token, role) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}&role=${role}`;

    const subject = "Verify your Email - Mini SOC";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Welcome to Mini SOC!</h2>
            <p>Please verify your email address to complete your registration.</p>
            <div style="margin: 20px 0;">
                <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </div>
            <p style="color: #7f8c8d; font-size: 12px;">Link expires in 1 hour.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
    `;

    await sendEmail(email, subject, html);
};

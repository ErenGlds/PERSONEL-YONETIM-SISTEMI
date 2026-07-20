import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
  }
  return transporter;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    await getTransporter().sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`E-posta gönderildi: ${to}`);
  } catch (error) {
    console.error(" E-posta gönderilemedi:", error);
  }
};

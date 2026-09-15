import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

let transporter;

const getRequiredSetting = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

const createTransporter = () => {
  const port = Number.parseInt(process.env.CPANEL_SMTP_PORT, 10) || 587;

  return nodemailer.createTransport({
    host: getRequiredSetting('CPANEL_SMTP_HOST'),
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    auth: {
      user: getRequiredSetting('CPANEL_EMAIL_USER'),
      pass: getRequiredSetting('CPANEL_EMAIL_PASS'),
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
    },
    disableFileAccess: true,
    disableUrlAccess: true,
  });
};

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const sendCpanelEmail = async ({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
}) => {
  const receivers = (Array.isArray(to) ? to : [to])
    .map((receiver) => receiver?.trim())
    .filter(Boolean);

  if (receivers.length === 0) {
    throw new Error('At least one email recipient is required');
  }

  if (!subject?.trim()) {
    throw new Error('Email subject is required');
  }

  const sender = {
    name: process.env.CPANEL_SENDER_NAME || 'ISAMC Team',
    address: getRequiredSetting('CPANEL_EMAIL_USER')
  };

  const mailOptions = {
    from: sender,
    to: receivers,
    subject,
    text,
    ...(html && { html }),
    ...(replyTo && { replyTo }),
    ...(attachments?.length && { attachments }),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    logger.info('Email sent successfully', {
      messageId: info.messageId,
      recipientCount: receivers.length,
      subject,
    });
    return info;
  } catch (error) {
    logger.error(`Email delivery failed: ${error.message}`, {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      subject,
      stack: error.stack,
    });
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    await getTransporter().verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.error(`SMTP connection verification failed: ${error.message}`, {
      code: error.code,
      command: error.command,
      stack: error.stack,
    });
    return false;
  }
};

export default sendCpanelEmail;

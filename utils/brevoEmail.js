import axios from 'axios';
import { describeBrevoError } from './brevoError.js';

const requiredSetting = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

// HTTPS works on hosting plans that block SMTP connections.
const sendBrevoEmail = async ({ to, subject, html, text, replyTo, attachments }) => {
  const receivers = (Array.isArray(to) ? to : [to])
    .map(email => typeof email === 'string' ? email.trim() : '')
    .filter(Boolean);
  if (!receivers.length) throw new Error('At least one email recipient is required');
  if (!subject?.trim()) throw new Error('Email subject is required');
  const apiKey = requiredSetting('BREVO_API_KEY');
  const payload = {
    sender: { email: requiredSetting('BREVO_SENDER_EMAIL'), name: process.env.BREVO_SENDER_NAME || 'ISAMC Team' },
    to: receivers.map(email => ({ email })),
    subject,
    ...(html && { htmlContent: html }),
    ...(text && { textContent: text }),
    ...(replyTo && { replyTo: { email: replyTo } }),
    ...(attachments?.length && {
      attachment: attachments.map(({ filename, content }) => {
        if (!filename || !Buffer.isBuffer(content)) throw new Error('Email attachments require a filename and Buffer content');
        return { name: filename, content: content.toString('base64') };
      }),
    }),
  };
  try {
    const { data } = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      timeout: 15_000,
    });
    if (!data?.messageId) throw new Error('Brevo did not acknowledge the email');
    return data;
  } catch (error) {
    // Axios errors contain API keys and message contents in their config.
    throw new Error(describeBrevoError(error));
  }
};

export default sendBrevoEmail;

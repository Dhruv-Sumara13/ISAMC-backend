import dotenv from 'dotenv';
import axios from 'axios';
import { getEmailProvider } from '../utils/emailProvider.js';
import { describeBrevoError } from '../utils/brevoError.js';
import { getBrevoApiKey } from '../utils/brevoApiKey.js';

dotenv.config();

// Read-only diagnostics: never sends mail or prints credentials/addresses.
async function checkEmail() {
  const provider = getEmailProvider();
  console.log(`Selected email provider: ${provider}`);
  if (provider !== 'brevo') {
    throw new Error('This service is using SMTP. For the Brevo setup, set EMAIL_PROVIDER=brevo and restart the service.');
  }
  for (const name of ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'CONTACT_EMAIL']) {
    if (!process.env[name]?.trim()) throw new Error(`${name} is missing. Set it in this service's environment.`);
  }
  const client = axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: { 'api-key': getBrevoApiKey() },
    timeout: 15000,
  });
  let account;
  let senders;
  try {
    account = (await client.get('/account')).data;
    senders = (await client.get('/senders')).data.senders;
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) throw new Error(describeBrevoError(error));
    if (status === 403) throw new Error('Brevo denied access (403). Check account activation, API permissions and authorized IP settings in Brevo.');
    throw new Error(`Brevo connection failed (${status || error.code || 'unknown error'}). Check network access and Brevo service status.`);
  }
  console.log('Brevo API key: accepted');
  if (account.relay?.enabled === false) throw new Error('Transactional email is disabled for this Brevo account. Activate it in Brevo or contact Brevo support.');
  const sender = senders?.find(item => item.email?.toLowerCase() === process.env.BREVO_SENDER_EMAIL.trim().toLowerCase());
  if (!sender?.active) throw new Error('The configured sender is missing or inactive. Verify BREVO_SENDER_EMAIL in this Brevo account.');
  console.log('Configured sender: active');
  console.log('Admin recipient: configured');
  console.log('Configuration checks passed. No email was sent. Use Brevo Transactional Logs to confirm actual delivery.');
}

checkEmail().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

export const getBrevoApiKey = (env = process.env) => {
  let key = env.BREVO_API_KEY?.trim();
  if (!key) throw new Error('BREVO_API_KEY is not configured');
  // Dashboard values sometimes include quotes copied from a .env example.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  if (/^BREVO_API_KEY\s*=|^Bearer\s/i.test(key)) {
    throw new Error('BREVO_API_KEY must contain only the key, without BREVO_API_KEY= or Bearer.');
  }
  if (key.startsWith('xsmtpsib-')) {
    throw new Error('BREVO_API_KEY contains an SMTP key. Use a Brevo API key instead.');
  }
  if (!key || /\s|["'*…]/.test(key) || key.includes('...')) {
    throw new Error('BREVO_API_KEY appears incomplete, masked, or contains internal whitespace. Copy the full key using Brevo’s copy button.');
  }
  return key;
};

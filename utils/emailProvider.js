export const getEmailProvider = (env = process.env) => {
  const configured = env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (configured && !['brevo', 'smtp'].includes(configured)) throw new Error('EMAIL_PROVIDER must be brevo or smtp');
  return configured || (env.RENDER === 'true' && env.BREVO_API_KEY?.trim() ? 'brevo' : 'smtp');
};

// Classify provider messages without logging credentials or request contents.
export const describeBrevoError = (error) => {
  const status = error.response?.status;
  const rawCode = error.response?.data?.code || error.code;
  const code = typeof rawCode === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(rawCode) ? rawCode : '';
  const detail = String(error.response?.data?.message || '').toLowerCase();
  let reason = '';
  if (/\bip\b|ip address/.test(detail)) {
    reason = 'Brevo blocked the server IP. Check Brevo Settings > Security > Authorized IPs and authorize the verified Render outbound IP.';
  } else if (/key.*not.*found|invalid.*key|key.*invalid/.test(detail)) {
    reason = 'Brevo did not recognize the API key loaded by this running service. Check the Render service environment and redeploy.';
  } else if (/key.*not.*enabled|key.*disabled|key.*inactive/.test(detail)) {
    reason = 'Brevo reports that this API key is disabled or inactive.';
  } else if (/not verified/.test(detail)) {
    reason = 'Brevo reports not verified. Check its account verification and IP authorization notifications.';
  } else if (status === 401) {
    reason = 'Authentication was rejected. Check both the deployed API key and Brevo Authorized IPs; a 401 does not prove the key is invalid.';
  }
  return `Brevo email request failed${status ? ` (HTTP ${status})` : ''}${code ? `: ${code}` : ''}${reason ? `. ${reason}` : ''}`;
};

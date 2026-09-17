import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import sendBrevoEmail from './brevoEmail.js';
import { getEmailProvider } from './emailProvider.js';

test('Render selects HTTPS when configured; explicit SMTP remains supported', () => {
  assert.equal(getEmailProvider({ RENDER: 'true', BREVO_API_KEY: 'test-key' }), 'brevo');
  assert.equal(getEmailProvider({ EMAIL_PROVIDER: 'smtp', RENDER: 'true', BREVO_API_KEY: 'test-key' }), 'smtp');
  assert.equal(getEmailProvider({ EMAIL_PROVIDER: 'brevo' }), 'brevo');
  assert.equal(getEmailProvider({}), 'smtp');
  assert.throws(() => getEmailProvider({ EMAIL_PROVIDER: 'invalid' }));
});

test('HTTPS adapter preserves membership email bodies, recipients and reply-to', async t => {
  const previous = { key: process.env.BREVO_API_KEY, sender: process.env.BREVO_SENDER_EMAIL };
  process.env.BREVO_API_KEY = 'test-only-key';
  process.env.BREVO_SENDER_EMAIL = 'sender@example.com';
  t.after(() => {
    for (const [key, value] of Object.entries({ BREVO_API_KEY: previous.key, BREVO_SENDER_EMAIL: previous.sender })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const requests = [];
  const post = t.mock.method(axios, 'post', async (url, body, options) => {
    requests.push({ url, body, options });
    return { data: { messageId: 'test-message' } };
  });
  await sendBrevoEmail({ to: 'admin@example.com', subject: 'Application', html: '<p>Application</p>', text: 'Application', replyTo: 'applicant@example.com' });
  await sendBrevoEmail({ to: 'applicant@example.com', subject: 'Confirmation', text: 'Saved' });
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.deepEqual(requests[0].body.replyTo, { email: 'applicant@example.com' });
  assert.equal(requests[0].body.htmlContent, '<p>Application</p>');
  assert.equal(requests[1].body.to[0].email, 'applicant@example.com');
  assert.equal(requests[0].options.timeout, 15000);
  await sendBrevoEmail({ to: 'admin@example.com', subject: 'Paper', attachments: [{ filename: 'paper.pdf', content: Buffer.from('pdf') }] });
  assert.deepEqual(requests[2].body.attachment, [{ name: 'paper.pdf', content: 'cGRm' }]);
  post.mock.mockImplementation(async () => {
    throw Object.assign(new Error('secret request details'), { config: { key: 'test-only-key' }, response: { status: 401, data: { code: 'unauthorized' } } });
  });
  await assert.rejects(sendBrevoEmail({ to: 'admin@example.com', subject: 'Application' }), error => {
    assert.equal(error.message, 'Brevo email request failed (HTTP 401): unauthorized');
    assert.equal(error.config, undefined);
    return true;
  });
});

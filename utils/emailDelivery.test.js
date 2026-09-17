import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import sendBrevoEmail from './brevoEmail.js';
import { getEmailProvider } from './emailProvider.js';
import { describeBrevoError } from './brevoError.js';
import { getBrevoApiKey } from './brevoApiKey.js';

test('dashboard key formatting is handled without revealing secrets', () => {
  for (const value of ['test-key', ' test-key ', '"test-key"', "'test-key'"]) {
    assert.equal(getBrevoApiKey({ BREVO_API_KEY: value }), 'test-key');
  }
  for (const value of ['', 'xsmtpsib-test-secret', 'BREVO_API_KEY=test-secret', 'Bearer test-secret', 'test secret', 'test***secret', 'test...secret']) {
    assert.throws(() => getBrevoApiKey({ BREVO_API_KEY: value }), error => !error.message.includes('test-secret'));
  }
});

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
    assert.match(error.message, /HTTP 401/);
    assert.match(error.message, /Authorized IPs/);
    assert.ok(!error.message.includes('test-only-key'));
    assert.equal(error.config, undefined);
    return true;
  });
});

test('401 diagnostics distinguish IP restrictions from invalid keys without leaking response secrets', () => {
  const failure = message => ({ response: { status: 401, data: { code: 'unauthorized', message } } });
  assert.match(describeBrevoError(failure('We have detected you are using an unrecognised IP address 192.0.2.1')), /blocked the server IP/);
  assert.match(describeBrevoError(failure('Key not found')), /did not recognize/);
  assert.match(describeBrevoError(failure('API Key is not enabled')), /disabled or inactive/);
  assert.ok(!describeBrevoError(failure('Key not found: secret-value')).includes('secret-value'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeMembershipType } from './membershipType.js';

// Exercise the actual controller with isolated database and mail dependencies.
const source = readFileSync(new URL('../controller/contactController.js', import.meta.url), 'utf8')
  .replace(/^import .*;\r?\n/gm, '')
  .replace(/export const /g, 'const ');
const createController = new Function('userModel', 'membershipModel', 'sendCpanelEmail',
  'normalizeMembershipType', 'randomBytes', `${source}\nreturn sendMembershipApplication;`);

const application = {
  fullName: 'Test Applicant', email: 'test@example.com', phone: '9876543210',
  institute: 'Test Institute', designation: 'Engineer', gender: 'Other',
  dateOfBirth: '1990-01-01', expertise: 'Manufacturing',
  membershipType: 'Individual Membership', tierPrice: '2000', tierDuration: '1 Year',
};

test('individual application is saved and acknowledged before slow emails finish', async () => {
  let saved;
  let response;
  let mailCalls = 0;
  let finishEmail;
  const slowEmail = new Promise(resolve => { finishEmail = resolve; });
  const controller = createController(
    { findByIdAndUpdate: async () => ({ _id: 'user-1' }) },
    { findOne: async () => null, create: async data => { saved = data; return { _id: 'membership-1' }; } },
    () => { mailCalls++; return slowEmail; }, normalizeMembershipType,
  );
  const res = {
    status(code) { assert.equal(code, 200); return this; },
    json(body) { assert.ok(saved); response = body; this.headersSent = true; },
  };
  const pending = controller({ body: application, user: { _id: 'user-1' } }, res);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(saved.membershipType, 'Regular');
  assert.equal(saved.status, 'pending');
  assert.equal(response.success, true);
  assert.equal(response.membershipId, 'membership-1');
  assert.equal(mailCalls, 2);
  finishEmail();
  await pending;
});

test('invalid membership is rejected before any database write or email', async () => {
  const controller = createController({}, {}, () => assert.fail('Unexpected email'), normalizeMembershipType);
  let status;
  await controller({ body: { ...application, membershipType: 'Invalid' } }, {
    status(code) { status = code; return this; },
    json(body) { assert.equal(status, 400); assert.equal(body.success, false); },
  });
});

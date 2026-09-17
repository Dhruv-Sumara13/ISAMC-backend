import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleData } from './sampleData.js';
import { normalizeMembershipType } from './membershipType.js';

test('every published sample tier maps to a stored membership category', () => {
  assert.deepEqual(sampleData.tier.map(tier => normalizeMembershipType(tier.type)),
    ['Student', 'Regular', 'Institutional', 'Honorary']);
});

test('existing categories accept plain names and display labels', () => {
  for (const type of ['Student', 'Regular', 'Senior', 'Institutional', 'International', 'Life', 'Honorary']) {
    assert.equal(normalizeMembershipType(type), type);
    assert.equal(normalizeMembershipType(`${type} Membership`), type);
  }
  assert.equal(normalizeMembershipType('  PROFESSIONAL   membership  '), 'Regular');
  assert.equal(normalizeMembershipType('corporate'), 'Institutional');
  assert.equal(normalizeMembershipType('Individual Membership'), 'Regular');
  assert.equal(normalizeMembershipType(' individual '), 'Regular');
});

test('invalid values cannot become membership categories', () => {
  for (const value of [undefined, null, {}, [], 123, '', 'Unknown Membership', 'constructor', '__proto__']) {
    assert.equal(normalizeMembershipType(value), undefined);
  }
});

test('all current live membership cards are supported', () => {
  assert.deepEqual(['Student Membership', 'Individual Membership', 'Corporate Membership', 'Sustaining Membership']
    .map(normalizeMembershipType), ['Student', 'Regular', 'Institutional', 'Sustaining']);
});

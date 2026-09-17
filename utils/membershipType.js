const membershipTypes = new Map([
  ['student', 'Student'],
  ['regular', 'Regular'],
  ['professional', 'Regular'],
  ['individual', 'Regular'],
  ['senior', 'Senior'],
  ['institutional', 'Institutional'],
  ['corporate', 'Institutional'],
  ['international', 'International'],
  ['life', 'Life'],
  ['honorary', 'Honorary'],
]);

// Tier display names and stored membership categories use different labels.
export const normalizeMembershipType = (value) => {
  if (typeof value !== 'string') return undefined;
  const key = value.trim().toLowerCase().replace(/\s+/g, ' ')
    .replace(/ membership$/, '');
  return membershipTypes.get(key);
};

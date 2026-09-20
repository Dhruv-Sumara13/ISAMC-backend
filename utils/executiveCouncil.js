// Repeated entries are consolidated, retaining the supplied affiliation.
export const executiveCouncilMembers = [
  ['Dr. Rajesh Srinivasa Raghavan', ''],
  ['Dr. Sajan Kapil', ''],
  ['Dr. Sushil Kumar Mishra', ''],
  ['Dr. Ujendra K. Komal', ''],
  ['Dr. Shiva Shekhar', 'IIT Jammu'],
  ['Dr. Amit Arora', ''],
  ['Dr. G. Saravana Kumar', 'IIT Madras'],
  ['Dr. G.D. Janaki Ram', 'IIT Hyderabad'],
  ['Prof. R. Lakshmi Narayan', 'IIT Delhi'],
  ['Dr. Prateek Saxena', 'IIT Mandi'],
  ['Dr. Gurminder Singh', ''],
  ['Dr. Murugaiyan Amirthalingam', ''],
  ['Mr. Rajeev G.P.', 'Super Auto Forge'],
  ['Mr. Rahul Chhabra', 'Dassault Systems'],
  ['Dr. D.V. Kiran', 'IIT Tirupati'],
  ['Mr. Revanth Meta', 'Intech Additive'],
  ['Mr. Anuj Buddhiraj', 'Phillips Corporation'],
  ['Dr. A. Durga', 'IIT Bombay'],
  ['Mr. Rajesh Khatirkar', ''],
  ['Mr. Ashish Yadav', 'ITER India'],
  ['Dr. Kaushal Jha', 'BARC'],
  ['Prof. Santosh Tamang', 'NERIST'],
  ['Prof. John Deb', 'NIT Agartala'],
  ['Prof. Biranchi Panda', 'IIT Guwahati'],
  ['Dr. C.V.S. Kiran', 'Red Balloon Aerospace Pvt. Ltd.'],
  ['Dr. Ritam Sarma', 'Aerodramus Pvt. Ltd.'],
].map(([fullName, affiliation], index) => ({
  _id: `ec-${index + 1}`, fullName, affiliation,
}));

export async function initializeExecutiveCouncil(DB) {
  // Only populate a missing section. An intentionally emptied list stays empty.
  await DB.updateOne(
    { executiveCouncil: { $exists: false } },
    { $set: { executiveCouncil: executiveCouncilMembers } },
  );
}

export function validateCouncilMember(member) {
  return member && typeof member.fullName === 'string' &&
    member.fullName.trim().length > 0 && member.fullName.length <= 200 &&
    (member.affiliation === undefined ||
      (typeof member.affiliation === 'string' && member.affiliation.length <= 200));
}

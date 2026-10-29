export const RATE = 500;

export const DEPTS = ['Admin', 'Accounts', 'Finance/Audit', 'ICT', 'Operations', 'Planning', 'Business Development'];

export const DESIG = {
  DG: 'Director General',
  DD: 'Deputy Director',
  AD: 'Assistant Director',
  SHO: 'Senior Health Officer',
  HO: 'Health Officer',
  AO: 'Admin Officer',
  SA: 'Senior Accountant',
  AC: 'Accountant',
  AS: 'Admin Secretary',
  DO: 'Data Officer',
  IT: 'IT Officer',
  DR: 'Driver',
  ST: 'Store Officer',
  MA: 'Maintenance Officer',
};

const STAFF = [];
// export const STAFF = [
//   { id: 'u11', name: 'Halima Abdullahi', role: 'Administrator', dept: 'ICT', des: 'Systems Administrator', rank: 'GL 12', gross: 385000, psn: 'KD/PSN/04112', status: 'Active', appt: 'Permanent', email: 'sysadmin@kadchma.gov.ng', phone: '08011223344', joined: '2018-03-01' },
//   { id: 'u3',  name: 'Ibrahim Musa',      role: 'Admin',            dept: 'Admin',            des: 'Admin Officer',                       rank: 'GL 10', gross: 298500,  psn: 'KD/PSN/03871', status: 'Active', appt: 'Permanent', email: 'admin@kadchma.gov.ng',    phone: '08022334455', joined: '2016-07-04' },
//   { id: 'u2',  name: 'Dr. Abubakar Hassan', role: 'DG',            dept: 'Admin',            des: 'Director General',                    rank: 'GL 17', gross: 1150000, psn: 'KD/PSN/00214', status: 'Active', appt: 'Permanent', email: 'dg@kadchma.gov.ng',       phone: '08033445566', joined: '2009-01-15' },
//   { id: 'u1',  name: 'Aisha Bello',       role: 'DAF',              dept: 'Admin',            des: 'Director Admin & Finance',            rank: 'GL 15', gross: 640000,  psn: 'KD/PSN/01290', status: 'Active', appt: 'Permanent', email: 'daf@kadchma.gov.ng',      phone: '08044556677', joined: '2011-05-22' },
//   { id: 'u4',  name: 'Fatima Yusuf',      role: 'Accounts',         dept: 'Accounts',         des: 'Principal Accountant',                rank: 'GL 12', gross: 402000,  psn: 'KD/PSN/02765', status: 'Active', appt: 'Permanent', email: 'accounts@kadchma.gov.ng', phone: '08055667788', joined: '2014-11-10' },
//   { id: 'u5',  name: 'Sani Danjuma',      role: 'Auditor',          dept: 'Finance/Audit',    des: 'Internal Auditor',                    rank: 'GL 12', gross: 398000,  psn: 'KD/PSN/02908', status: 'Active', appt: 'Permanent', email: 'audit@kadchma.gov.ng',    phone: '08066778899', joined: '2015-03-17' },
//   { id: 'u7',  name: 'Yakubu Garba',      role: 'Department_Head',  dept: 'Planning',         des: 'Head of Department, Planning',        rank: 'GL 14', gross: 560000,  psn: 'KD/PSN/01644', status: 'Active', appt: 'Permanent', email: 'planning@kadchma.gov.ng', phone: '08077889900', joined: '2012-08-30' },
//   { id: 'u6',  name: 'Zainab Aliyu',      role: 'User',             dept: 'Planning',         des: 'Programme Officer',                   rank: 'GL 09', gross: 245000,  psn: 'KD/PSN/05530', status: 'Active', appt: 'Permanent', email: 'z.aliyu@kadchma.gov.ng',  phone: '08088990011', joined: '2019-04-08' },
//   { id: 'u8',  name: 'Umar Shehu',        role: 'IT',               dept: 'ICT',              des: 'IT Support Officer',                  rank: 'GL 08', gross: 212000,  psn: 'KD/PSN/06021', status: 'Active', appt: 'Permanent', email: 'it@kadchma.gov.ng',       phone: '08099001122', joined: '2020-02-14' },
//   { id: 'u9',  name: 'Joseph Audu',       role: 'Maintenance',      dept: 'Admin',            des: 'Maintenance Officer',                 rank: 'GL 07', gross: 178500,  psn: 'KD/PSN/06280', status: 'Active', appt: 'Permanent', email: 'maint@kadchma.gov.ng',    phone: '08010112233', joined: '2021-06-01' },
//   { id: 'u10', name: 'Hauwa Lawal',       role: 'Store',            dept: 'Admin',            des: 'Store Officer',                       rank: 'GL 08', gross: 205000,  psn: 'KD/PSN/05912', status: 'Active', appt: 'Permanent', email: 'store@kadchma.gov.ng',    phone: '08021122334', joined: '2020-09-18' },
//   { id: 'u12', name: 'Bilkisu Sule',      role: 'User',             dept: 'Operations',       des: 'Enrolment Officer',                   rank: 'GL 08', gross: 208000,  psn: 'KD/PSN/06133', status: 'Active', appt: 'Permanent', email: 'b.sule@kadchma.gov.ng',   phone: '08032233445', joined: '2020-11-23' },
//   { id: 'u13', name: 'Emmanuel Bako',     role: 'Department_Head',  dept: 'Operations',       des: 'Head of Department, Operations',      rank: 'GL 14', gross: 548000,  psn: 'KD/PSN/01702', status: 'Active', appt: 'Permanent', email: 'ops@kadchma.gov.ng',      phone: '08043344556', joined: '2013-02-11' },
//   { id: 'u14', name: 'Rakiya Idris',      role: 'User',             dept: 'Planning',         des: 'Data Analyst',                        rank: 'GL 09', gross: 238000,  psn: 'KD/PSN/05877', status: 'Active', appt: 'Permanent', email: 'r.idris@kadchma.gov.ng',  phone: '08054455667', joined: '2019-07-29' },
//   { id: 'u15', name: 'Nuhu Abdulkadir',   role: 'User',             dept: 'Accounts',         des: 'Accountant II',                       rank: 'GL 08', gross: 204500,  psn: 'KD/PSN/06310', status: 'Active', appt: 'Permanent', email: 'n.abdulkadir@kadchma.gov.ng', phone: '08065566778', joined: '2021-03-05' },
//   { id: 'u16', name: 'Grace Yohanna',     role: 'User',             dept: 'Operations',       des: 'Quality Assurance Officer',           rank: 'GL 09', gross: 241000,  psn: 'KD/PSN/05798', status: 'Active', appt: 'Permanent', email: 'g.yohanna@kadchma.gov.ng', phone: '08076677889', joined: '2019-01-14' },
//   { id: 'u17', name: 'Maryam Sani',       role: 'User',             dept: 'Business Development', des: 'Marketing Officer',               rank: 'GL 08', gross: 206000,  psn: 'KD/PSN/06402', status: 'Active', appt: 'Permanent', email: 'm.sani@kadchma.gov.ng',   phone: '08087788990', joined: '2021-08-30' },
//   { id: 'u18', name: 'Abdullahi Tanimu',  role: 'User',             dept: 'Operations',       des: 'Corps Member',                        rank: '—',     gross: 33000,   psn: '—',            status: 'Active', appt: 'Adhoc',     email: 'a.tanimu@kadchma.gov.ng', phone: '08098899001', joined: '2026-09-01' },
//   { id: 'u19', name: 'Ladi Kure',         role: 'User',             dept: 'Accounts',         des: 'Accounts Assistant',                  rank: 'GL 05', gross: 121000,  psn: 'KD/PSN/05120', status: 'Active', appt: 'Permanent', email: 'l.kure@kadchma.gov.ng',   phone: '08019900112', joined: '2022-04-04' },
// ];

export const REQUESTS = [
  {
    id: 'REQ-0142', owner: 'u6', department: 'Operations',
    head: 'Fuel and logistics for enrollee sensitisation, Zaria LGA',
    header: 'Fuel and logistics for enrollee sensitisation, Zaria LGA',
    details: 'Fuel for two operational vehicles and refreshments for ward focal persons during the five-day enrollee sensitisation exercise across Zaria LGA wards.',
    requestText: 'Fuel for two operational vehicles and refreshments for ward focal persons during the five-day enrollee sensitisation exercise across Zaria LGA wards.',
    totalCost: 486000, amount: 486000,
    supportingDocument: null, supportingDocumentName: 'Zaria_sensitisation_budget.pdf',
    status: 'Submitted', stage: 0,
    created: '2026-10-21T09:12:00+01:00',
    trail: [{ role: 'owner', at: '2026-10-21T09:12:00+01:00', note: 'Request submitted' }],
    comments: [],
  },
  {
    id: 'REQ-0139', owner: 'u12', department: 'ICT',
    head: 'Printing of 5,000 enrollee ID cards',
    header: 'Printing of 5,000 enrollee ID cards',
    details: 'Batch printing of PVC enrollee ID cards for newly registered BHCPF enrollees in Kaduna South and Chikun.',
    requestText: 'Batch printing of PVC enrollee ID cards for newly registered BHCPF enrollees in Kaduna South and Chikun.',
    totalCost: 1250000, amount: 1250000,
    supportingDocument: null, supportingDocumentName: 'ID_card_quote_Oct.pdf',
    status: 'Approved by DG', stage: 3,
    recommendation: 'Printing is required urgently to meet Q4 enrolment targets. Vendor is pre-approved.',
    created: '2026-10-14T11:40:00+01:00',
    trail: [
      { role: 'owner',           at: '2026-10-14T11:40:00+01:00', note: 'Request submitted' },
      { role: 'Department_Head', at: '2026-10-15T10:02:00+01:00', note: 'Recommended — urgent operational need' },
      { role: 'DG',              at: '2026-10-17T15:20:00+01:00', note: 'Approved. Ensure vendor is on the state approved list.' },
    ],
    comments: [{ by: 'u2', text: 'Approved. Ensure the vendor is on the state approved list.', at: '2026-10-17T15:21:00+01:00' }],
  },
  {
    id: 'REQ-0136', owner: 'u14', department: 'Planning',
    head: 'Data bundle for field enumerators (October)',
    header: 'Data bundle for field enumerators (October)',
    details: 'Monthly data subscription for 24 field enumerators uploading enrolment records from facilities.',
    requestText: 'Monthly data subscription for 24 field enumerators uploading enrolment records from facilities.',
    totalCost: 144000, amount: 144000,
    voucher: 'VCH-2026-0268',
    status: 'Approved by Auditor For Pre-Audit', stage: 5,
    recommendation: 'Essential for real-time facility data uploads.',
    approval: 'Approved.',
    created: '2026-10-06T08:30:00+01:00',
    trail: [
      { role: 'owner',           at: '2026-10-06T08:30:00+01:00', note: 'Request submitted' },
      { role: 'Department_Head', at: '2026-10-06T12:00:00+01:00', note: 'Recommended' },
      { role: 'DG',              at: '2026-10-08T09:45:00+01:00', note: 'Approved' },
      { role: 'Accounts',        at: '2026-10-09T14:00:00+01:00', note: 'Voucher raised — VCH-2026-0268' },
      { role: 'Admin',           at: '2026-10-10T10:10:00+01:00', note: 'Payment voucher issued' },
      { role: 'Auditor',         at: '2026-10-12T11:00:00+01:00', note: 'Pre-audit completed — documents in order' },
    ],
    comments: [],
  },
  {
    id: 'REQ-0131', owner: 'u15', department: 'Accounts',
    head: 'Office stationery restock, Accounts unit',
    header: 'Office stationery restock, Accounts unit',
    details: 'A4 paper, box files and toner cartridges for the Accounts unit for Q4.',
    requestText: 'A4 paper, box files and toner cartridges for the Accounts unit for Q4.',
    totalCost: 98500, amount: 98500,
    status: 'Rejected by DG', stage: -1,
    recommendation: 'Recommended — standard consumables.',
    created: '2026-09-29T10:00:00+01:00',
    trail: [
      { role: 'owner',           at: '2026-09-29T10:00:00+01:00', note: 'Request submitted' },
      { role: 'Department_Head', at: '2026-09-30T09:00:00+01:00', note: 'Recommended — standard consumables' },
      { role: 'DG',              at: '2026-10-03T16:00:00+01:00', note: 'Rejected — route through the Store Officer; Q4 stationery was already procured centrally.' },
    ],
    comments: [],
  },
  {
    id: 'REQ-0127', owner: 'u6', department: 'Planning',
    head: 'Stakeholder meeting with LGA health coordinators',
    header: 'Stakeholder meeting with LGA health coordinators',
    details: 'Venue and lunch for the quarterly review meeting with 23 LGA PHC coordinators.',
    requestText: 'Venue and lunch for the quarterly review meeting with 23 LGA PHC coordinators.',
    totalCost: 375000, amount: 375000,
    voucher: 'VCH-2026-0241',
    status: 'Payment Completed', stage: 7,
    recommendation: 'Quarterly coordination meeting — essential for PHC oversight.',
    approval: 'Approved. Ensure venue procurement follows policy.',
    created: '2026-09-12T09:00:00+01:00',
    trail: [
      { role: 'owner',           at: '2026-09-12T09:00:00+01:00', note: 'Request submitted' },
      { role: 'Department_Head', at: '2026-09-12T15:00:00+01:00', note: 'Recommended' },
      { role: 'DG',              at: '2026-09-15T10:00:00+01:00', note: 'Approved. Ensure venue procurement follows policy.' },
      { role: 'Accounts',        at: '2026-09-16T11:00:00+01:00', note: 'Voucher raised — VCH-2026-0241' },
      { role: 'Admin',           at: '2026-09-15T13:00:00+01:00', note: 'Payment voucher issued' },
      { role: 'Auditor',         at: '2026-09-17T09:30:00+01:00', note: 'Pre-audit passed' },
      { role: 'Auditor',         at: '2026-09-30T11:00:00+01:00', note: 'Post-audit passed — all receipts verified' },
      { role: 'Accounts',        at: '2026-10-01T10:00:00+01:00', note: 'Payment released to vendor' },
    ],
    comments: [],
  },
  {
    id: 'REQ-0119', owner: 'u9', department: 'Admin',
    head: 'Generator servicing — main office',
    header: 'Generator servicing — main office',
    details: 'Full servicing and oil change for the 20 KVA Mikano generator at the main office. Last service was January 2026.',
    requestText: 'Full servicing and oil change for the 20 KVA Mikano generator at the main office. Last service was January 2026.',
    totalCost: 185000, amount: 185000,
    status: 'Recommended by HoD', stage: 1,
    recommendation: 'Maintenance is overdue. Generator is critical for operations during power outages.',
    created: '2026-10-18T08:00:00+01:00',
    trail: [
      { role: 'owner',           at: '2026-10-18T08:00:00+01:00', note: 'Request submitted' },
      { role: 'Department_Head', at: '2026-10-19T10:30:00+01:00', note: 'Recommended — maintenance overdue' },
    ],
    comments: [],
  },
];

export const FACILITIES = [
  { id: 'h1',  name: 'PHC Kawo',                           code: 'KD/PHC/0101', bank: 'Zenith Bank', acct: '1014528836', enrollees: 2860 },
  { id: 'h2',  name: 'PHC Tudun Wada',                     code: 'KD/PHC/0102', bank: 'Access Bank', acct: '0698714452', enrollees: 3415 },
  { id: 'h3',  name: 'Comprehensive Health Centre Kakuri',  code: 'KD/PHC/0107', bank: 'First Bank',  acct: '3087120994', enrollees: 4120 },
  { id: 'h4',  name: 'PHC Ungwan Rimi',                    code: 'KD/PHC/0111', bank: 'UBA',         acct: '2091846730', enrollees: 1980 },
  { id: 'h5',  name: 'PHC Barnawa',                        code: 'KD/PHC/0114', bank: 'GTBank',      acct: '0122459870', enrollees: 2675 },
  { id: 'h6',  name: 'PHC Sabon Tasha',                    code: 'KD/PHC/0119', bank: 'Jaiz Bank',   acct: '0004581296', enrollees: 3102 },
  { id: 'h7',  name: 'PHC Kafanchan',                      code: 'KD/PHC/0302', bank: 'First Bank',  acct: '3091452287', enrollees: 2240 },
  { id: 'h8',  name: 'PHC Zaria City',                     code: 'KD/PHC/0205', bank: 'Zenith Bank', acct: '1019873345', enrollees: 3755 },
  { id: 'h9',  name: 'PHC Malali',                         code: 'KD/PHC/0121', bank: 'Access Bank', acct: '0711349982', enrollees: 1645 },
  { id: 'h10', name: 'PHC Saminaka',                       code: 'KD/PHC/0410', bank: 'Polaris Bank',acct: '1772093318', enrollees: 1390 },
];

function mkBatch(period, stage, log) {
  return {
    id: `CAP-${period}`,
    period,
    stage,
    trail: log,
    advices: FACILITIES.map((f, i) => ({
      fid: f.id,
      facility: f.name,
      code: f.code,
      bank: f.bank,
      acct: f.acct,
      enrollees: f.enrollees - (period === '2026-09' ? 40 * (i % 3) : 0),
      amount: (f.enrollees - (period === '2026-09' ? 40 * (i % 3) : 0)) * RATE,
    })),
  };
}

export const CAPITATION = [
  mkBatch('2026-10', 1, [
    { role: 'Accounts', at: '2026-10-22T12:00:00+01:00', note: 'Generated from enrolment register' },
  ]),
  mkBatch('2026-09', 3, [
    { role: 'Accounts', at: '2026-09-20T12:00:00+01:00', note: 'Generated' },
    { role: 'DAF',      at: '2026-09-21T10:00:00+01:00', note: 'Approved — 10 facilities, amounts verified' },
    { role: 'DG',       at: '2026-09-22T16:00:00+01:00', note: 'Signed off' },
  ]),
];

export const PAYROLL = (() => {
  const active = STAFF.filter(s => s.status === 'Active');
  const lines = active.map(s => ({ uid: s.id, name: s.name, dept: s.dept, des: s.des, rank: s.rank, gross: s.gross }));
  return [
    {
      id: 'PAY-2026-10', period: '2026-10', stage: 1,
      trail: [{ role: 'Admin', at: '2026-10-23T15:30:00+01:00', note: 'Locked and submitted for review' }],
      lines,
    },
    {
      id: 'PAY-2026-09', period: '2026-09', stage: 4,
      trail: [
        { role: 'Admin',     at: '2026-09-22T10:00:00+01:00', note: 'Locked and submitted for review' },
        { role: 'DAF',       at: '2026-09-23T11:00:00+01:00', note: 'Reviewed and forwarded to DG' },
        { role: 'DG',        at: '2026-09-24T09:00:00+01:00', note: 'Approved' },
        { role: 'Accounts',  at: '2026-09-25T14:00:00+01:00', note: 'Payment released' },
      ],
      lines,
    },
  ];
})();

export const ACTIVITIES = [
  {
    id: 'ACT-031', title: 'Enrolment officers refresher training', type: 'Training',
    desc: 'Two-day refresher on the updated enrolment form, biometric capture and data quality checks.',
    startDate: '2026-11-04', endDate: '2026-11-05', location: 'KADCHMA Training Room, Kaduna',
    owner: 'u7', participants: ['u6', 'u14', 'u12', 'u16'], reportOfficer: 'u6', stage: 1,
    trail: [{ role: 'owner', at: '2026-10-20T10:00:00+01:00', note: '' }],
    comments: [],
  },
  {
    id: 'ACT-028', title: 'Facility accreditation field visit, Southern Kaduna', type: 'Field',
    desc: 'Accreditation re-assessment of 12 primary facilities in Kafanchan, Kagoro and Zonkwa.',
    startDate: '2026-10-13', endDate: '2026-10-16', location: "Jema'a and Kaura LGAs",
    owner: 'u7', participants: ['u6', 'u14'], reportOfficer: 'u14', stage: 4,
    trail: [
      { role: 'owner', at: '2026-10-01T09:00:00+01:00', note: '' },
      { role: 'DAF',   at: '2026-10-02T11:00:00+01:00', note: 'Recommended' },
      { role: 'DG',    at: '2026-10-05T15:00:00+01:00', note: 'Approved' },
    ],
    report: null, comments: [],
  },
  {
    id: 'ACT-024', title: 'Data quality workshop', type: 'Training',
    desc: 'Workshop on reconciling enrolment data with facility capitation lists.',
    startDate: '2026-09-08', endDate: '2026-09-09', location: 'Hamdala Hotel, Kaduna',
    owner: 'u7', participants: ['u6', 'u14', 'u4'], reportOfficer: 'u6', stage: 5,
    trail: [
      { role: 'owner', at: '2026-08-20T09:00:00+01:00', note: '' },
      { role: 'DAF',   at: '2026-08-21T09:00:00+01:00', note: 'Recommended' },
      { role: 'DG',    at: '2026-08-25T09:00:00+01:00', note: 'Approved' },
    ],
    report: 'Data_quality_workshop_report.pdf', comments: [],
  },
];

export const MEMOS = [
  {
    id: 'MEM-I-018', type: 'Internal',
    subject: 'Submission of Q4 departmental work plans',
    body: 'All Heads of Department are to submit their Q4 work plans and budget estimates to the Admin & Finance department not later than Friday, 31 October 2026.\n\nLate submissions will not be considered for the Q4 cash plan.',
    from: 'u1', at: '2026-10-22T09:00:00+01:00',
    to: ['u7', 'u13'], depts: ['Accounts', 'ICT'], readBy: ['u7', 'u11'], comments: [],
  },
  {
    id: 'MEM-I-017', type: 'Internal',
    subject: 'Staff ID card recapture exercise',
    body: 'All staff are to report to the ICT unit for biometric recapture for the new staff ID cards between 27 and 31 October 2026, 9:00 to 15:00.',
    from: 'u1', at: '2026-10-20T11:00:00+01:00',
    to: [], depts: ['Admin', 'Accounts', 'Finance/Audit', 'ICT', 'Operations', 'Planning', 'Business Development'], readBy: ['u3', 'u4', 'u11', 'u1', 'u2'], comments: [],
  },
  {
    id: 'MEM-E-009', type: 'External',
    subject: 'Release of BHCPF Q3 capitation funds',
    org: 'National Health Insurance Authority (NHIA)',
    received: '2026-10-21', file: 'NHIA_BHCPF_Q3_release.pdf',
    stage: 1,
    trail: [{ role: 'Admin', at: '2026-10-21T14:00:00+01:00', note: 'Uploaded' }],
    comments: [],
  },
  {
    id: 'MEM-E-008', type: 'External',
    subject: 'Invitation to state health sector review',
    org: 'Kaduna State Ministry of Health',
    received: '2026-10-09', file: 'MoH_sector_review_invite.pdf',
    stage: 4,
    trail: [
      { role: 'Admin', at: '2026-10-09T10:00:00+01:00', note: 'Uploaded' },
      { role: 'DAF',   at: '2026-10-10T09:00:00+01:00', note: 'Approved' },
      { role: 'DG',    at: '2026-10-10T15:00:00+01:00', note: 'Acknowledged' },
      { role: 'Admin', at: '2026-10-11T09:00:00+01:00', note: 'Circulated' },
    ],
    comments: [],
  },
];

export const FOLDERS = [
  { id: 'f1',  name: 'Policies & guidelines', zone: 'org' },
  { id: 'f2',  name: 'Circulars',             zone: 'org' },
  { id: 'f3',  name: 'Templates & forms',     zone: 'org' },
  { id: 'f4',  name: 'Admin',            zone: 'dept', dept: 'Admin' },
  { id: 'f9',  name: 'Finance/Audit',    zone: 'dept', dept: 'Finance/Audit' },
  { id: 'f5',  name: 'Accounts',         zone: 'dept', dept: 'Accounts' },
  { id: 'f6',  name: 'ICT',              zone: 'dept', dept: 'ICT' },
  { id: 'f7',  name: 'Planning',         zone: 'dept', dept: 'Planning' },
  { id: 'f8',  name: 'Operations',       zone: 'dept', dept: 'Operations' },
  { id: 'f10', name: 'Business Development', zone: 'dept', dept: 'Business Development' },
];

export const FILES = [
  // f1 — Policies & guidelines
  { id: 'fl1',  folder: 'f1', name: 'KADCHMA Operational Guidelines 2026.pdf',      mime: 'PDF',  ver: 2, size: 2550000, uploaded: '2026-06-02', by: 'u3' },
  { id: 'fl2',  folder: 'f1', name: 'Staff Leave Policy.docx',                      mime: 'DOCX', ver: 1, size: 182000,  uploaded: '2026-03-04', by: 'u1' },
  { id: 'fl16', folder: 'f1', name: 'Procurement & Vendor Policy 2026.pdf',         mime: 'PDF',  ver: 1, size: 890000,  uploaded: '2026-05-10', by: 'u3' },
  { id: 'fl17', folder: 'f1', name: 'IT Acceptable Use Policy.pdf',                 mime: 'PDF',  ver: 2, size: 540000,  uploaded: '2026-04-18', by: 'u11' },
  { id: 'fl18', folder: 'f1', name: 'Staff Code of Conduct.pdf',                    mime: 'PDF',  ver: 3, size: 720000,  uploaded: '2026-01-15', by: 'u1' },
  { id: 'fl19', folder: 'f1', name: 'Whistle-Blower Protection Policy.docx',        mime: 'DOCX', ver: 1, size: 145000,  uploaded: '2026-02-01', by: 'u3' },

  // f2 — Circulars
  { id: 'fl3',  folder: 'f2', name: 'Circular 014 — Office hours during Ramadan.pdf', mime: 'PDF', ver: 1, size: 96000, uploaded: '2026-02-24', by: 'u3' },
  { id: 'fl20', folder: 'f2', name: 'Circular 015 — Q3 Statutory Returns submission deadline.pdf', mime: 'PDF', ver: 1, size: 78000, uploaded: '2026-07-05', by: 'u3' },
  { id: 'fl21', folder: 'f2', name: 'Circular 016 — Revised field travel allowance rates.pdf',     mime: 'PDF', ver: 1, size: 112000, uploaded: '2026-08-12', by: 'u1' },
  { id: 'fl22', folder: 'f2', name: 'Circular 017 — ID card recapture exercise.pdf',               mime: 'PDF', ver: 1, size: 65000,  uploaded: '2026-10-20', by: 'u3' },
  { id: 'fl23', folder: 'f2', name: 'Circular 018 — Q4 departmental work plan submission.pdf',     mime: 'PDF', ver: 1, size: 88000,  uploaded: '2026-10-22', by: 'u1' },

  // f3 — Templates & forms
  { id: 'fl4',  folder: 'f3', name: 'Financial request form.docx',                  mime: 'DOCX', ver: 3, size: 52000,  uploaded: '2026-09-30', by: 'u11' },
  { id: 'fl24', folder: 'f3', name: 'Annual leave application form.docx',           mime: 'DOCX', ver: 2, size: 38000,  uploaded: '2026-01-10', by: 'u10' },
  { id: 'fl25', folder: 'f3', name: 'Activity report template.docx',                mime: 'DOCX', ver: 4, size: 61000,  uploaded: '2026-03-22', by: 'u7' },
  { id: 'fl26', folder: 'f3', name: 'Asset requisition form.xlsx',                  mime: 'XLSX', ver: 1, size: 44000,  uploaded: '2026-05-14', by: 'u10' },
  { id: 'fl27', folder: 'f3', name: 'Procurement request form.docx',                mime: 'DOCX', ver: 2, size: 49000,  uploaded: '2026-06-30', by: 'u3' },
  { id: 'fl28', folder: 'f3', name: 'Staff appraisal form — 2026.xlsx',             mime: 'XLSX', ver: 1, size: 96000,  uploaded: '2026-09-01', by: 'u1' },

  // f4 — Admin
  { id: 'fl7',  folder: 'f4', name: 'Vehicle maintenance log.xlsx',                 mime: 'XLSX', ver: 2, size: 71000,  uploaded: '2026-10-01', by: 'u9' },
  { id: 'fl29', folder: 'f4', name: 'Office inventory checklist — October 2026.xlsx', mime: 'XLSX', ver: 1, size: 83000, uploaded: '2026-10-05', by: 'u10' },
  { id: 'fl30', folder: 'f4', name: 'Vehicle fuel log — Q3 2026.xlsx',              mime: 'XLSX', ver: 1, size: 57000,  uploaded: '2026-10-08', by: 'u9' },
  { id: 'fl31', folder: 'f4', name: 'Generator maintenance schedule.pdf',           mime: 'PDF',  ver: 1, size: 130000, uploaded: '2026-09-15', by: 'u10' },
  { id: 'fl32', folder: 'f4', name: 'Lease agreement — Garki office 2026.pdf',      mime: 'PDF',  ver: 1, size: 420000, uploaded: '2026-01-03', by: 'u3' },

  // f9 — Finance/Audit
  { id: 'fl33', folder: 'f9', name: 'Audit findings — Q2 2026.pdf',                mime: 'PDF',  ver: 1, size: 1750000, uploaded: '2026-08-14', by: 'u5' },
  { id: 'fl34', folder: 'f9', name: 'Internal audit plan 2026.pdf',                mime: 'PDF',  ver: 2, size: 670000,  uploaded: '2026-01-20', by: 'u5' },
  { id: 'fl35', folder: 'f9', name: 'Finance committee minutes — September 2026.docx', mime: 'DOCX', ver: 1, size: 98000, uploaded: '2026-10-04', by: 'u15' },
  { id: 'fl36', folder: 'f9', name: 'Cash management policy.pdf',                  mime: 'PDF',  ver: 1, size: 310000,  uploaded: '2026-03-01', by: 'u3' },

  // f5 — Accounts
  { id: 'fl5',  folder: 'f5', name: 'Q3 2026 Trial balance.xlsx',                  mime: 'XLSX', ver: 1, size: 318000,  uploaded: '2026-10-07', by: 'u4' },
  { id: 'fl37', folder: 'f5', name: 'September 2026 bank reconciliation.xlsx',      mime: 'XLSX', ver: 1, size: 204000,  uploaded: '2026-10-10', by: 'u4' },
  { id: 'fl38', folder: 'f5', name: 'BHCPF capitation schedule — Q3 2026.pdf',     mime: 'PDF',  ver: 1, size: 890000,  uploaded: '2026-10-12', by: 'u4' },
  { id: 'fl39', folder: 'f5', name: 'Chart of accounts 2026.xlsx',                 mime: 'XLSX', ver: 3, size: 172000,  uploaded: '2026-01-08', by: 'u15' },
  { id: 'fl40', folder: 'f5', name: 'October payroll summary.xlsx',                mime: 'XLSX', ver: 1, size: 265000,  uploaded: '2026-10-24', by: 'u4' },

  // f6 — ICT
  { id: 'fl41', folder: 'f6', name: 'IT asset register — October 2026.xlsx',       mime: 'XLSX', ver: 5, size: 148000,  uploaded: '2026-10-03', by: 'u11' },
  { id: 'fl42', folder: 'f6', name: 'Network topology diagram.pdf',                mime: 'PDF',  ver: 2, size: 560000,  uploaded: '2026-07-22', by: 'u11' },
  { id: 'fl43', folder: 'f6', name: 'Server room access log — October 2026.xlsx',  mime: 'XLSX', ver: 1, size: 44000,   uploaded: '2026-10-20', by: 'u8' },
  { id: 'fl44', folder: 'f6', name: 'Software licence inventory 2026.xlsx',        mime: 'XLSX', ver: 2, size: 92000,   uploaded: '2026-06-15', by: 'u11' },
  { id: 'fl45', folder: 'f6', name: 'Data backup policy.pdf',                      mime: 'PDF',  ver: 1, size: 230000,  uploaded: '2026-04-09', by: 'u11' },

  // f7 — Planning
  { id: 'fl6',  folder: 'f7', name: 'Enrolment dashboard — September.pdf',         mime: 'PDF',  ver: 1, size: 1210000, uploaded: '2026-10-03', by: 'u14' },
  { id: 'fl46', folder: 'f7', name: 'Q3 2026 performance report.pdf',              mime: 'PDF',  ver: 1, size: 1840000, uploaded: '2026-10-15', by: 'u7' },
  { id: 'fl47', folder: 'f7', name: 'Annual workplan 2026 — Planning dept.xlsx',   mime: 'XLSX', ver: 2, size: 310000,  uploaded: '2026-02-10', by: 'u7' },
  { id: 'fl48', folder: 'f7', name: 'Facility accreditation tracker — Q3.xlsx',    mime: 'XLSX', ver: 3, size: 192000,  uploaded: '2026-10-16', by: 'u14' },
  { id: 'fl49', folder: 'f7', name: 'BHCPF enrolment data — September 2026.xlsx',  mime: 'XLSX', ver: 1, size: 435000,  uploaded: '2026-10-05', by: 'u6' },

  // f8 — Operations
  { id: 'fl50', folder: 'f8', name: 'Field operations schedule — Q4 2026.xlsx',    mime: 'XLSX', ver: 1, size: 128000,  uploaded: '2026-10-02', by: 'u13' },
  { id: 'fl51', folder: 'f8', name: 'Facility visit reports — Southern Kaduna.pdf',mime: 'PDF',  ver: 1, size: 2100000, uploaded: '2026-10-18', by: 'u6' },
  { id: 'fl52', folder: 'f8', name: 'LGA coordinator contact list.xlsx',           mime: 'XLSX', ver: 4, size: 67000,   uploaded: '2026-09-28', by: 'u13' },
  { id: 'fl53', folder: 'f8', name: 'Community health worker training attendance.pdf', mime: 'PDF', ver: 1, size: 340000, uploaded: '2026-09-12', by: 'u6' },

  // f10 — Business Development
  { id: 'fl54', folder: 'f10', name: 'Partnership MOU — Kaduna State MoH 2026.pdf', mime: 'PDF', ver: 1, size: 980000,  uploaded: '2026-03-30', by: 'u7' },
  { id: 'fl55', folder: 'f10', name: 'Grant proposal — WHO HSS 2027.docx',          mime: 'DOCX', ver: 2, size: 520000, uploaded: '2026-09-20', by: 'u7' },
  { id: 'fl56', folder: 'f10', name: 'Stakeholder mapping 2026.xlsx',               mime: 'XLSX', ver: 1, size: 195000, uploaded: '2026-07-14', by: 'u13' },
  { id: 'fl57', folder: 'f10', name: 'Business development strategy 2026–2028.pdf', mime: 'PDF',  ver: 1, size: 1430000,uploaded: '2026-01-25', by: 'u2' },
];

export const CONVOS = [
  {
    id: 'c1', name: 'Finance Team', group: true,
    members: ['u1', 'u3', 'u4', 'u5', 'u15', 'u11'],
    msgs: [
      { from: 'u4',  text: 'October trial balance is in the Accounts folder.',              at: '2026-10-24T09:10:00+01:00' },
      { from: 'u5',  text: 'Thanks. I will start pre-audit on REQ-0136 today.',             at: '2026-10-24T09:24:00+01:00' },
      { from: 'u1',  text: 'Please prioritise the October payroll run. It is with me for review now.', at: '2026-10-24T10:02:00+01:00' },
    ],
  },
  {
    id: 'c2', name: 'Management', group: true,
    members: ['u1', 'u2', 'u7', 'u13', 'u11', 'u3'],
    msgs: [
      { from: 'u2', text: 'Management meeting moves to Tuesday 10:00.',  at: '2026-10-23T16:40:00+01:00' },
      { from: 'u7', text: 'Noted, sir.',                                  at: '2026-10-23T16:45:00+01:00' },
    ],
  },
  {
    id: 'c3', group: false, members: ['u6', 'u7'],
    msgs: [
      { from: 'u6', text: 'Good morning sir, I have submitted the Zaria sensitisation request.', at: '2026-10-21T09:15:00+01:00' },
      { from: 'u7', text: 'I will look at it before the end of the day.',                       at: '2026-10-21T09:40:00+01:00' },
    ],
  },
  {
    id: 'c4', group: false, members: ['u3', 'u4'],
    msgs: [
      { from: 'u3', text: 'Is the September payroll summary available?',  at: '2026-10-22T11:00:00+01:00' },
      { from: 'u4', text: 'Yes, export it from the payroll run page.',    at: '2026-10-22T11:06:00+01:00' },
    ],
  },
  {
    id: 'c5', group: false, members: ['u8', 'u11'],
    msgs: [
      { from: 'u8', text: 'Server room UPS replaced.', at: '2026-10-24T08:00:00+01:00' },
    ],
  },
];

export const ASSETS = [
  { tag: 'KCH/ICT/0012', name: 'HP EliteBook 840 G8',           cat: 'Computer',   sn: '5CG1234XYZ',  bought: '2024-03-12', value: 780000,   cond: 'Good',    to: 'u6',  hist: [{ u: 'u6',  out: '2024-03-20', by: 'u10' }] },
  { tag: 'KCH/ICT/0013', name: 'HP EliteBook 840 G8',           cat: 'Computer',   sn: '5CG1234XZA',  bought: '2024-03-12', value: 780000,   cond: 'Good',    to: 'u14', hist: [{ u: 'u14', out: '2024-03-20', by: 'u10' }] },
  { tag: 'KCH/ICT/0031', name: 'Dell OptiPlex 7090',            cat: 'Computer',   sn: 'DL7090-883',  bought: '2023-07-02', value: 560000,   cond: 'Fair',    to: 'u4',  hist: [{ u: 'u4',  out: '2023-07-10', by: 'u10' }] },
  { tag: 'KCH/VEH/0004', name: 'Toyota Hilux 2.4 (KD 412 KAD)',cat: 'Vehicle',    sn: 'MR0HA3CD0N01',bought: '2022-01-18', value: 28500000, cond: 'Good',    to: 'u7',  hist: [{ u: 'u7',  out: '2022-02-01', by: 'u10' }] },
  { tag: 'KCH/VEH/0006', name: 'Toyota Hiace Bus (KD 077 KAD)',cat: 'Vehicle',    sn: 'JTFSX23P5M',  bought: '2021-05-09', value: 31000000, cond: 'Fair',    to: null,  hist: [{ u: 'u9',  out: '2023-01-04', by: 'u10' }] },
  { tag: 'KCH/FUR/0102', name: 'Executive office desk',         cat: 'Furniture',  sn: '—',           bought: '2020-11-23', value: 240000,   cond: 'Good',    to: 'u2',  hist: [{ u: 'u2',  out: '2021-01-10', by: 'u10' }] },
  { tag: 'KCH/FUR/0145', name: 'Conference chairs (set of 12)',  cat: 'Furniture',  sn: '—',           bought: '2023-02-14', value: 1080000,  cond: 'Damaged', to: null,  hist: [] },
  { tag: 'KCH/EQP/0020', name: 'Canon imageRUNNER 2630i',       cat: 'Equipment',  sn: 'CNR2630-221', bought: '2024-08-05', value: 2150000,  cond: 'Good',    to: null,  hist: [] },
];

export const TICKETS = [
  { id: 'SR-0219', track: 'IT',          title: 'Cannot connect to office Wi-Fi',       desc: 'My laptop drops the KADCHMA-Staff network every few minutes since Monday.',          by: 'u6',  status: 'Open',       at: '2026-10-24T08:42:00+01:00', note: '', thread: [] },
  { id: 'SR-0216', track: 'Maintenance', title: 'Air conditioner leaking, Room 14',     desc: 'The AC in Room 14 drips water onto the filing cabinet.',                            by: 'u4',  status: 'In Progress', at: '2026-10-22T10:15:00+01:00', note: '', thread: [{ who: 'u9', text: 'Technician booked for Monday morning.', at: '2026-10-23T09:00:00+01:00' }] },
  { id: 'SR-0212', track: 'IT',          title: 'Email account locked',                  desc: 'Locked out after password expiry.',                                                 by: 'u6',  status: 'Resolved',    at: '2026-10-20T13:00:00+01:00', note: 'Password reset and MFA re-enrolled. Please sign in with the temporary password sent to your phone.', thread: [] },
  { id: 'SR-0207', track: 'Maintenance', title: 'Broken door handle, Accounts office',  desc: 'Main door handle came off.',                                                         by: 'u15', status: 'Closed',      at: '2026-10-14T09:00:00+01:00', note: 'Handle replaced.', thread: [] },
];


export const LEAVE = [
  {
    id: 'lv1', who: 'u12', type: 'Annual Leave',
    from: '2026-11-03', to: '2026-11-21',
    department: 'Operations',
    reason: 'Annual family vacation and personal rest period.',
    status: 'Submitted',
    created: '2026-10-22T09:00:00+01:00',
    trail: [{ role: 'owner', at: '2026-10-22T09:00:00+01:00', note: 'Leave applied' }],
  },
  {
    id: 'lv2', who: 'u14', type: 'Casual Leave',
    from: '2026-10-28', to: '2026-10-29',
    department: 'Planning',
    reason: 'Attending sibling\'s wedding ceremony in Kano.',
    status: 'Approved by HOD',
    created: '2026-10-24T10:15:00+01:00',
    trail: [
      { role: 'owner', at: '2026-10-24T10:15:00+01:00', note: 'Leave applied' },
      { role: 'Department_Head', at: '2026-10-25T08:30:00+01:00', note: 'Approved. Short notice but acceptable.' },
    ],
  },
  {
    id: 'lv3', who: 'u9', type: 'Sick Leave',
    from: '2026-10-20', to: '2026-10-22',
    department: 'Admin',
    reason: 'Fever and doctor-recommended bed rest.',
    status: 'Approved by Admin',
    created: '2026-10-20T07:45:00+01:00',
    trail: [
      { role: 'owner', at: '2026-10-20T07:45:00+01:00', note: 'Leave applied' },
      { role: 'Department_Head', at: '2026-10-20T09:10:00+01:00', note: 'Approved.' },
      { role: 'DG', at: '2026-10-20T11:00:00+01:00', note: 'Approved. Wishing Joseph quick recovery.' },
      { role: 'Admin', at: '2026-10-20T12:30:00+01:00', note: 'Approved and filed.' },
    ],
  },
  {
    id: 'lv4', who: 'u6', type: 'Annual Leave',
    from: '2026-12-01', to: '2026-12-20',
    department: 'Planning',
    reason: 'End of year leave before Q1 budget planning cycle.',
    status: 'Submitted',
    created: '2026-10-25T14:00:00+01:00',
    trail: [{ role: 'owner', at: '2026-10-25T14:00:00+01:00', note: 'Leave applied' }],
  },
  {
    id: 'lv5', who: 'u17', type: 'Maternity Leave',
    from: '2026-11-10', to: '2027-02-07',
    department: 'Business Development',
    reason: 'Maternity leave for newborn care.',
    status: 'Approved by DG',
    created: '2026-10-18T10:00:00+01:00',
    trail: [
      { role: 'owner', at: '2026-10-18T10:00:00+01:00', note: 'Leave applied' },
      { role: 'Department_Head', at: '2026-10-19T08:00:00+01:00', note: 'Approved. Congratulations Maryam.' },
      { role: 'DG', at: '2026-10-20T09:30:00+01:00', note: 'Approved. HR please ensure cover is arranged.' },
    ],
  },
  {
    id: 'lv6', who: 'u8', type: 'Casual Leave',
    from: '2026-10-30', to: '2026-10-30',
    department: 'ICT',
    reason: 'Personal errand — hospital appointment.',
    status: 'Rejected by HOD',
    created: '2026-10-29T08:00:00+01:00',
    trail: [
      { role: 'owner', at: '2026-10-29T08:00:00+01:00', note: 'Leave applied' },
      { role: 'Department_Head', at: '2026-10-29T09:15:00+01:00', note: 'Rejected — critical system migration scheduled same day.' },
    ],
  },
];

export const ACCOUNTS = [
  {
    name: 'Capitation pool', bal: 184560000,
    subs: [['BHCPF', 112400000], ['Formal sector', 72160000]],
  },
  {
    name: 'Operations', bal: 23880000,
    subs: [['Overheads', 15200000], ['Field operations', 8680000]],
  },
  {
    name: 'Personnel', bal: 41250000,
    subs: [['Salaries', 41250000]],
  },
];

export const NOTIFS = [
  { id: 'n1', to: 'role:Department_Head', title: 'Request awaiting your recommendation', body: 'REQ-0142 · Fuel and logistics for enrollee sensitisation', page: 'requests', ref: 'REQ-0142', type: 'request', read: false, at: '2026-10-21T09:13:00+01:00' },
  { id: 'n2', to: 'role:Admin',           title: 'Request at your stage',                  body: 'REQ-0139 · Printing of 5,000 enrollee ID cards',            page: 'requests', ref: 'REQ-0139', type: 'request', read: false, at: '2026-10-17T15:22:00+01:00' },
  { id: 'n3', to: 'u3',                   title: 'October payroll run submitted',           body: 'PAY-2026-10 has been submitted for your review.',            page: 'payroll',  ref: 'PAY-2026-10', type: 'payroll', read: false, at: '2026-10-23T15:31:00+01:00' },
  { id: 'n4', to: 'u6',                   title: 'Request REQ-0142 submitted',              body: 'Your request has been submitted and is pending recommendation.', page: 'requests', ref: 'REQ-0142', type: 'request', read: true, at: '2026-10-21T09:12:00+01:00' },
  { id: 'n5', to: 'u3',                   title: 'New IT ticket SR-0219',                  body: 'SR-0219 · Cannot connect to office Wi-Fi',                   page: 'service',  ref: 'SR-0219', type: 'service', read: true, at: '2026-10-24T08:43:00+01:00' },
];

export const PERSONAS = ['u3', 'u11', 'u2', 'u1', 'u4', 'u5', 'u7', 'u6', 'u8', 'u9', 'u10', 'u12', 'u13'];

export const ROLE_LABEL = {
  Administrator: 'Administrator',
  Admin: 'Admin Officer',
  DG: 'Director General',
  DAF: 'Director Admin & Finance',
  Accounts: 'Accounts',
  Auditor: 'Auditor',
  Department_Head: 'Head of Department',
  User: 'Staff',
  IT: 'IT Unit',
  Maintenance: 'Maintenance Unit',
  Store: 'Store Officer',
};

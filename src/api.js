import { API_BASE_URL } from './config';

const BASE = API_BASE_URL;

function getToken() {
  try { return localStorage.getItem('kadchma_token') ?? ''; } catch { return ''; }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? res.statusText);
  return json.payLoad;
}

export const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
};

// Multipart upload (no Content-Type header — browser sets boundary automatically)
export async function apiUpload(path, formData) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? res.statusText);
  return json.payLoad;
}

export function setToken(token, userId) {
  try {
    localStorage.setItem('kadchma_token', token);
    if (userId) localStorage.setItem('kadchma_me', userId);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem('kadchma_token');
    localStorage.removeItem('kadchma_me');
  } catch {}
}

export function getStoredUserId() {
  try { return localStorage.getItem('kadchma_me'); } catch { return null; }
}

export function mapLeave(l) {
  const user = l.user;
  return {
    id: l._id,
    who: typeof user === 'object' && user !== null ? user._id : user,
    type: l.type ?? '',
    from: l.startDate ? new Date(l.startDate).toISOString().slice(0, 10) : '',
    to: l.endDate ? new Date(l.endDate).toISOString().slice(0, 10) : '',
    department: l.department ?? '',
    reason: l.reason ?? '',
    status: l.status ?? 'Submitted',
    created: l.createdAt ?? l.created ?? new Date().toISOString(),
    trail: l.trail ?? [],
  };
}

export function mapRequest(r) {
  return {
    id: r._id,
    owner: typeof r.user === 'object' && r.user !== null ? r.user._id : r.user,
    header: r.header ?? '',
    head: r.header ?? '',
    requestText: r.requestText ?? '',
    details: r.requestText ?? '',
    totalCost: r.totalCost ?? 0,
    amount: r.totalCost ?? 0,
    department: r.department ?? '',
    status: r.status ?? 'Submitted',
    supportingDocument: r.supportingDocument ?? null,
    recommendation: r.recommendation ?? '',
    approval: r.approval ?? '',
    account: r.account ?? null,
    voucher: r.voucher ?? null,
    created: r.createdAt ?? '',
    trail: r.trail ?? [],
    comments: (r.comments ?? []).map(c => ({
      by: typeof c.by === 'object' && c.by !== null ? c.by._id : c.by,
      text: c.comment ?? c.text ?? '',
      at: c.at ?? c.createdAt ?? '',
    })),
  };
}

export function mapActivity(a) {
  return {
    id: a._id,
    title: a.title ?? '',
    type: a.type ?? '',
    desc: a.desc ?? '',
    startDate: a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : '',
    endDate: a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : '',
    location: a.location ?? '',
    department: a.department ?? '',
    owner: typeof a.owner === 'object' && a.owner !== null ? a.owner._id : a.owner,
    participants: (a.participants ?? []).map(p => typeof p === 'object' && p !== null ? p._id : p),
    reportOfficer: typeof a.reportOfficer === 'object' && a.reportOfficer !== null ? a.reportOfficer._id : a.reportOfficer,
    stage: a.stage ?? 1,
    status: a.status ?? 'Pending dept head',
    trail: (a.trail ?? []).map(t => ({
      role: t.role ?? '',
      at: t.at ?? '',
      note: t.note ?? '',
    })),
    comments: (a.comments ?? []).map(c => ({
      by: typeof c.by === 'object' && c.by !== null ? c.by._id : c.by,
      text: c.text ?? '',
      at: c.at ?? '',
    })),
    report: a.reportUrl ? { name: a.reportName || 'report', url: a.reportUrl } : null,
    amount: a.amount ?? 0,
  };
}

export function mapPayroll(p) {
  return {
    id: p._id,
    period: p.period ?? '',
    stage: p.stage ?? 0,
    lines: (p.lines ?? []).map(l => ({
      uid: l.uid ? String(l.uid) : '',
      name: l.name ?? '',
      dept: l.dept ?? '',
      des: l.des ?? '',
      rank: l.rank ?? '',
      gross: l.gross ?? 0,
    })),
    trail: (p.trail ?? []).map(t => ({
      role: t.role ?? '',
      at: t.at ?? '',
      note: t.note ?? '',
    })),
  };
}

export function mapMemo(m) {
  const cb = m.createdBy;
  return {
    id: m._id,
    type: m.type ?? 'Internal',
    subject: m.subject ?? '',
    body: m.body ?? '',
    org: m.org ?? '',
    received: m.received ? new Date(m.received).toISOString().slice(0, 10) : '',
    fileUrl: m.fileUrl ?? '',
    fileName: m.fileName ?? '',
    createdBy: typeof cb === 'object' && cb !== null
      ? { id: cb._id, name: [cb.firstName, cb.lastName].filter(Boolean).join(' ') }
      : { id: String(cb ?? ''), name: '' },
    at: m.createdAt ?? '',
  };
}

export function mapFolder(f) {
  return {
    id: f._id,
    name: f.name ?? '',
    zone: f.zone ?? 'org',
    dept: f.dept ?? '',
  };
}

export function mapDocument(d) {
  const by = d.uploadedBy;
  return {
    id: d._id,
    folder: d.folderId ?? '',
    name: d.name ?? '',
    fileUrl: d.fileUrl ?? '',
    size: d.size ?? 0,
    ver: d.ver ?? '1',
    mimeType: d.mimeType ?? '',
    by: typeof by === 'object' && by !== null
      ? { id: by._id, name: [by.firstName, by.lastName].filter(Boolean).join(' ') }
      : { id: String(by ?? ''), name: '' },
    uploaded: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
  };
}

export function mapNotif(n) {
  return {
    id: n._id,
    to: typeof n.recipient === 'object' && n.recipient !== null ? n.recipient._id : n.recipient,
    title: n.title ?? '',
    body: n.body ?? '',
    type: n.type ?? '',
    ref: n.relatedId ? String(n.relatedId) : null,
    page: n.page ?? 'home',
    read: n.read ?? false,
    at: n.createdAt ?? n.at ?? new Date().toISOString(),
  };
}

export function mapMeeting(m) {
  return {
    id: m._id,
    title: m.title ?? '',
    type: m.type ?? 'General',
    date: m.meetingDate ? new Date(m.meetingDate).toISOString().slice(0, 10) : '',
    time: m.time ?? '09:00',
    venue: m.venue ?? '',
    participants: (m.participants ?? []).map(p => typeof p === 'object' && p !== null ? p._id : p),
    createdBy: typeof m.createdBy === 'object' && m.createdBy !== null ? m.createdBy._id : (m.createdBy ?? null),
    minutes: m.minutesUrl ? { name: m.minutesName || 'minutes', url: m.minutesUrl } : null,
  };
}

export function mapUser(u) {
  const name = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
  return {
    id: u._id,
    name,
    email: u.email ?? '',
    phone: u.phoneNumber ?? '',
    dept: (u.department ?? '').replace(/_/g, ' '),
    des: u.designation ?? 'Staff',
    role: u.role ?? 'User',
    appt: u.ApptType ?? 'Permanent',
    rank: u.gradeLevel ?? '',
    gross: u.gross ?? 30000,
    psn: u.psn ?? '—',
    status: u.status ?? 'Active',
    joined: u.employmentDate
      ? new Date(u.employmentDate).toISOString().slice(0, 10)
      : (u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : ''),
    gender: u.gender ?? '',
    nin: u.nin ?? '',
    bvn: u.bvn ?? '',
    bankName: u.bankName ?? '',
    bankAccountNumber: u.bankAccountNumber ?? '',
    nNumber: u.nNumber ?? '',
    cadre: u.cadre ?? '',
    step: u.step ?? '',
    highestQualification: u.highestQualification ?? '',
    emergencyContact: u.emergencyContact ?? '',
    dateofFirstAppointment: u.dateofFirstAppointment ?? '',
    dateofConfirmation: u.dateofConfirmation ?? '',
    openFileNum: u.openFileNum ?? '',
    secFileNum: u.secFileNum ?? '',
  };
}

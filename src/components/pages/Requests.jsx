import { useState } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api } from '../../api';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

// Status values mirror the backend request model exactly
const STATUS = {
  SUBMITTED:           'Submitted',
  RECOMMENDED:         'Recommended by HoD',
  REJECTED_HOD:        'Rejected by HoD',
  APPROVED_DG:         'Approved by DG',
  REJECTED_DG:         'Rejected by DG',
  APPROVED_ACCOUNTS:   'Approved by Accounts',
  REJECTED_ACCOUNTS:   'Rejected by Accounts',
  APPROVED_ADMIN:      'Approved by Admin',
  REJECTED_ADMIN:      'Rejected by Admin',
  PRE_AUDIT_PASSED:    'Approved by Auditor For Pre-Audit',
  PRE_AUDIT_REJECTED:  'Rejected by Auditor For Pre-Audit',
  POST_AUDIT_PASSED:   'Approved by Auditor For Post-Audit',
  POST_AUDIT_REJECTED: 'Rejected by Auditor For Post-Audit',
  PAYMENT_COMPLETED:   'Payment Completed',
};

// Visual flow steps (linear happy path) — Staff→HoD→Admin→Auditor(pre)→DG→Accounts→Auditor(post)
const FLOW_STEPS = [
  { label: 'Submitted',    statuses: [STATUS.SUBMITTED] },
  { label: 'HoD Review',  statuses: [STATUS.RECOMMENDED] },
  { label: 'Admin',        statuses: [STATUS.APPROVED_ADMIN] },
  { label: 'Pre-Audit',   statuses: [STATUS.PRE_AUDIT_PASSED] },
  { label: 'DG Approval', statuses: [STATUS.APPROVED_DG] },
  { label: 'Accounts',    statuses: [STATUS.APPROVED_ACCOUNTS] },
  { label: 'Post-Audit',  statuses: [STATUS.POST_AUDIT_PASSED] },
  { label: 'Payment',     statuses: [STATUS.PAYMENT_COMPLETED] },
];

const REJECTED_STATUSES = [
  STATUS.REJECTED_HOD, STATUS.REJECTED_DG, STATUS.REJECTED_ACCOUNTS,
  STATUS.REJECTED_ADMIN, STATUS.PRE_AUDIT_REJECTED, STATUS.POST_AUDIT_REJECTED,
];

const DEPARTMENTS = ['Admin', 'Accounts', 'Finance/Audit', 'ICT', 'Operations', 'Planning', 'Business Development'];

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n ?? 0);
}
function fdate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fdatetime(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function stepIndex(status) {
  return FLOW_STEPS.findIndex(s => s.statuses.includes(status));
}

function isRejected(status) { return REJECTED_STATUSES.includes(status); }

// Who can do what — Staff→HoD→Admin→Auditor(pre)→DG→Accounts→Auditor(post)
function getAction(status, role, isAdminHOD = false) {
  if (status === STATUS.SUBMITTED && role === 'Department_Head') return 'recommend';
  if (status === STATUS.RECOMMENDED && (role === 'Admin' || role === 'Administrator') && isAdminHOD) return 'approve_admin';
  if (status === STATUS.APPROVED_ADMIN && role === 'Auditor') return 'pre_audit';
  if (status === STATUS.PRE_AUDIT_PASSED && role === 'DG') return 'approve_dg';
  if (status === STATUS.APPROVED_DG && role === 'Accounts') return 'approve_accounts';
  if (status === STATUS.APPROVED_ACCOUNTS && role === 'Auditor') return 'post_audit';
  if (status === STATUS.POST_AUDIT_PASSED && role === 'Accounts') return 'payment';
  return null;
}

function nextStatus(action) {
  return {
    recommend:        STATUS.RECOMMENDED,
    approve_admin:    STATUS.APPROVED_ADMIN,
    pre_audit:        STATUS.PRE_AUDIT_PASSED,
    approve_dg:       STATUS.APPROVED_DG,
    approve_accounts: STATUS.APPROVED_ACCOUNTS,
    post_audit:       STATUS.POST_AUDIT_PASSED,
    payment:          STATUS.PAYMENT_COMPLETED,
  }[action];
}

function rejectStatus(action) {
  return {
    recommend:        STATUS.REJECTED_HOD,
    approve_admin:    STATUS.REJECTED_ADMIN,
    pre_audit:        STATUS.PRE_AUDIT_REJECTED,
    approve_dg:       STATUS.REJECTED_DG,
    approve_accounts: STATUS.REJECTED_ACCOUNTS,
    post_audit:       STATUS.POST_AUDIT_REJECTED,
  }[action];
}

function actionLabel(action) {
  return {
    recommend:        'Recommend to Admin',
    approve_admin:    'Approve & forward to Auditor',
    pre_audit:        'Pass pre-audit — forward to DG',
    approve_dg:       'Approve & forward to Accounts',
    approve_accounts: 'Process payment',
    post_audit:       'Pass post-audit',
    payment:          'Mark payment completed',
  }[action] ?? 'Approve';
}

// ── New Request Dialog ──────────────────────────────────────────────────────
function NewRequestDialog({ me, data, dispatch }) {
  const user = data.staff.find(s => s.id === me);
  const [form, setForm] = useState({
    header: '',
    requestText: '',
    totalCost: '',
    department: user?.dept ?? '',
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.header.trim() && form.requestText.trim() && Number(form.totalCost) > 0;

  const handleFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
  };

  const removeFile = () => {
    setFile(null);
    // reset the file input
    const inp = document.getElementById('req-doc-input');
    if (inp) inp.value = '';
  };

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const body = {
        user: me,
        header: form.header.trim(),
        requestText: form.requestText.trim(),
        totalCost: Number(form.totalCost),
        department: form.department,
        status: STATUS.SUBMITTED,
      };
      await api.post('/requests', body);
      queryClient.invalidateQueries({ queryKey: KEYS.requests });
      dispatch({ type: 'CLOSE_DIALOG' });
      dispatch({ type: 'SHOW_TOAST', payload: `Request submitted successfully` });
    } catch (err) {
      setSubmitError(err.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'var(--scrim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}>
      <div
        style={{
          background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md)', padding: 'var(--s6)',
          width: 'min(560px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s4)' }}>
          <h2 style={{ fontSize: 18 }}>New Financial Request</h2>
          <button className="iconbtn" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}><Icon name="close" size={18} /></button>
        </div>

        <div className="stack">
          <div className="field">
            <label>Subject / Header <span style={{ color: 'var(--accent)' }}>*</span></label>
            <input
              type="text"
              value={form.header}
              onChange={e => set('header', e.target.value)}
              placeholder="e.g. Fuel and logistics for field visit, Zaria LGA"
            />
          </div>

          <div className="field">
            <label>Request details <span style={{ color: 'var(--accent)' }}>*</span></label>
            <textarea
              rows={5}
              value={form.requestText}
              onChange={e => set('requestText', e.target.value)}
              placeholder="Describe what the funds will be used for, who benefits, and any relevant context…"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
            <div className="field">
              <label>Total amount (₦) <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                type="number"
                min="1"
                value={form.totalCost}
                onChange={e => set('totalCost', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">— select —</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Supporting document <span className="muted small">(optional · PDF)</span></label>
            {file ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--s3)',
                background: 'var(--brand-subtle)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '10px var(--s4)',
              }}>
                <Icon name="attach" size={16} style={{ color: 'var(--brand-text)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <span className="small muted" style={{ flexShrink: 0 }}>
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  className="iconbtn"
                  style={{ flexShrink: 0 }}
                  onClick={removeFile}
                  title="Remove file"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="req-doc-input"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 'var(--s2)', padding: 'var(--s6)',
                  border: '2px dashed var(--border)', borderRadius: 'var(--r-md)',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--brand-subtle)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.background = '';
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped && dropped.type === 'application/pdf') setFile(dropped);
                }}
              >
                <Icon name="attach" size={24} style={{ color: 'var(--ink-muted)' }} />
                <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  <span style={{ color: 'var(--brand-text)', fontWeight: 600 }}>Click to upload</span> or drag & drop
                </span>
                <span className="small muted">PDF only · max 10 MB</span>
              </label>
            )}
            <input
              id="req-doc-input"
              type="file"
              accept="application/pdf,.pdf"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>

          {submitError && (
            <div style={{ color: 'var(--danger)', fontSize: 13 }}>{submitError}</div>
          )}
          <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end', marginTop: 'var(--s2)' }}>
            <button className="btn sec" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}>Cancel</button>
            <button className="btn pri" onClick={submit} disabled={!valid || submitting}>
              <Icon name="send" size={15} /> {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Voucher / Memo print template ───────────────────────────────────────────
function VoucherTemplate({ req, data }) {
  const owner = data.staff.find(s => s.id === req.owner);
  const approver = req.trail.find(t => t.role === 'DG');
  const accountsEntry = req.trail.find(t => t.role === 'Accounts' || t.role === 'approve_accounts');
  return (
    <div style={{
      fontFamily: 'serif', background: '#fff', color: '#000',
      padding: '48px', maxWidth: 700, margin: '0 auto',
      border: '1px solid #ccc', borderRadius: 4,
      fontSize: 13, lineHeight: '1.6',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>KADCHMA</div>
        <div style={{ fontSize: 12 }}>Kaduna State Contributory Health Management Agency</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          Payment Voucher / Financial Request Memo
        </div>
      </div>

      {/* Reference block */}
      <table style={{ width: '100%', marginBottom: 20, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', verticalAlign: 'top', fontSize: 12 }}>
              <strong>Reference No.:</strong> {req.id}<br />
              <strong>Date:</strong> {req.created ? fdate(req.created) : '—'}<br />
              <strong>Department:</strong> {req.department ?? owner?.dept ?? '—'}
            </td>
            <td style={{ width: '50%', verticalAlign: 'top', fontSize: 12, textAlign: 'right' }}>
              <strong>Originator:</strong> {owner?.name ?? '—'}<br />
              <strong>Status:</strong> {req.status ?? STATUS.SUBMITTED}<br />
              <strong>Account:</strong> {req.account ?? 'Operations'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Subject */}
      <div style={{ background: '#f5f5f5', padding: '10px 14px', borderLeft: '4px solid #1a4fad', marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#555' }}>Subject</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{req.head ?? req.header}</div>
      </div>

      {/* Body */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#555', marginBottom: 6 }}>Details of Request</div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{req.requestText ?? req.details}</p>
      </div>

      {/* Amount */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '2px solid #1a4fad', borderRadius: 4, padding: '12px 16px', marginBottom: 24,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>TOTAL AMOUNT REQUESTED</span>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1a4fad' }}>
          {naira(req.totalCost ?? req.amount)}
        </span>
      </div>

      {/* Approval signatures */}
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#555', marginBottom: 12 }}>
        Approval trail
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#1a4fad', color: '#fff' }}>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Stage</th>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Role</th>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Note</th>
          </tr>
        </thead>
        <tbody>
          {(req.trail ?? []).map((t, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '5px 10px' }}>{i + 1}</td>
              <td style={{ padding: '5px 10px' }}>{t.role}</td>
              <td style={{ padding: '5px 10px' }}>{t.at ? fdate(t.at) : '—'}</td>
              <td style={{ padding: '5px 10px' }}>{t.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature lines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 32 }}>
        {[
          { label: 'Originator', name: owner?.name ?? '' },
          { label: 'Head of Finance / DG', name: approver ? 'Signed' : '' },
          { label: 'Accounts Officer', name: accountsEntry ? 'Signed' : '' },
        ].map(({ label, name }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: 6, fontSize: 11 }}>
              <div>{name || '_____________________'}</div>
              <div style={{ color: '#555' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ccc', marginTop: 32, paddingTop: 10, fontSize: 10, color: '#777', textAlign: 'center' }}>
        KADCHMA · Plot 1201 Constitution Avenue, Kaduna · This is an official payment document — retain for audit purposes.
      </div>
    </div>
  );
}

// ── Requests list ────────────────────────────────────────────────────────────
export default function Requests() {
  const { me, sel, dialog } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const isSuperRole = ['Admin', 'Administrator'].includes(user?.role ?? '');
  const role = ['Admin', 'Administrator', 'DG'].includes(user?.role ?? '') ? (user?.role ?? '') : user?.des === 'Department_Head' ? 'Department_Head' : (user?.role ?? '');
  const isSuper = isSuperRole || user?.role === 'DG';
  const isAdminHOD = isSuperRole && user?.des === 'Department_Head' && user?.dept === 'Admin';

  const [filter, setFilter] = useState('');

  const requests = data.requests.filter(r => {
    const myDept = user?.dept;
    if (!isSuper && role !== 'Accounts' && role !== 'Auditor' && role !== 'DAF') {
      if (r.owner !== me) {
        const owner = data.staff.find(s => s.id === r.owner);
        if (role === 'Department_Head' && owner?.dept !== myDept) return false;
        if (!['Department_Head', 'DAF', 'Accounts', 'Auditor', 'DG'].includes(role) && r.owner !== me) return false;
      }
    }
    const status = r.status ?? STATUS.SUBMITTED;
    if (filter && status !== filter) return false;
    return true;
  });

  const selected = sel ? data.requests.find(r => r.id === sel) : null;
  if (selected) {
    return <RequestDetail req={selected} role={role} isAdminHOD={isAdminHOD} me={me} data={data} dispatch={dispatch} isSuper={isSuper} />;
  }

  const canCreate = ['User', 'Department_Head', 'Admin', 'Administrator'].includes(role) || isSuper;

  const allStatuses = [...new Set(data.requests.map(r => r.status ?? STATUS.SUBMITTED))];

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Finance</span>
          <h1>Financial Requests</h1>
        </div>
        {canCreate && (
          <button className="btn pri" onClick={() => dispatch({ type: 'OPEN_DIALOG', payload: 'newRequest' })}>
            <Icon name="plus" size={16} /> New request
          </button>
        )}
      </div>

      <div className="card flush">
        <div className="chead">
          <div className="filters">
            <label className="label">Status</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All statuses</option>
              {Object.values(STATUS).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Subject</th>
                <th>Submitted by</th>
                <th>Department</th>
                <th>Status</th>
                <th className="r">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={6} className="empty">No requests found.</td></tr>
              )}
              {requests.map(r => {
                const owner = data.staff.find(s => s.id === r.owner);
                const status = r.status ?? STATUS.SUBMITTED;
                const rejected = isRejected(status);
                return (
                  <tr key={r.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: r.id })}>
                    <td className="num" style={{ fontWeight: 600 }}>{r.id}</td>
                    <td>{r.head ?? r.header}</td>
                    <td>{owner?.name ?? '—'}</td>
                    <td><span className="tag">{r.department ?? owner?.dept ?? '—'}</span></td>
                    <td>
                      <span style={{
                        display: 'inline-block', borderRadius: 'var(--r-full)',
                        padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                        background: rejected ? 'var(--danger-subtle)' : status === STATUS.PAYMENT_COMPLETED ? '#dcfce7' : 'var(--brand-subtle)',
                        color: rejected ? 'var(--danger)' : status === STATUS.PAYMENT_COMPLETED ? '#15803d' : 'var(--brand-text)',
                      }}>{status}</span>
                    </td>
                    <td className="r num">{naira(r.totalCost ?? r.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dialog === 'newRequest' && (
        <NewRequestDialog me={me} data={data} dispatch={dispatch} />
      )}
    </>
  );
}

// ── Request detail ───────────────────────────────────────────────────────────
function RequestDetail({ req, role, isAdminHOD, me, data, dispatch, isSuper }) {
  const [comment, setComment] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState('');

  const owner = data.staff.find(s => s.id === req.owner);
  const status = req.status ?? STATUS.SUBMITTED;
  const action = getAction(status, role, isAdminHOD);
  const rejected = isRejected(status);

  const curStep = stepIndex(status);

  const refreshRequests = () => {
    queryClient.invalidateQueries({ queryKey: KEYS.requests });
  };

  const doAction = async () => {
    const newStatus = nextStatus(action);
    setActing(true);
    setActError('');
    try {
      await api.put(`/requests/${req.id}`, { status: newStatus });
      await refreshRequests();
      dispatch({ type: 'SHOW_TOAST', payload: `Request ${newStatus.toLowerCase()}` });
      dispatch({ type: 'SET_SEL', payload: null });
    } catch (err) {
      setActError(err.message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const doReject = async () => {
    if (!rejectNote.trim()) return;
    const newStatus = rejectStatus(action);
    setActing(true);
    setActError('');
    try {
      await api.put(`/requests/${req.id}`, { status: newStatus, note: rejectNote });
      await refreshRequests();
      dispatch({ type: 'SHOW_TOAST', payload: 'Request rejected' });
      setShowReject(false);
      dispatch({ type: 'SET_SEL', payload: null });
    } catch (err) {
      setActError(err.message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/requests/${req.id}/comment`, { name: me, comment: comment.trim() });
      await refreshRequests();
      setComment('');
    } catch {
      queryClient.invalidateQueries({ queryKey: KEYS.requests });
      setComment('');
    }
  };

  const canPrint = [STATUS.APPROVED_DG, STATUS.APPROVED_ACCOUNTS, STATUS.APPROVED_ADMIN,
    STATUS.PRE_AUDIT_PASSED, STATUS.POST_AUDIT_PASSED, STATUS.PAYMENT_COMPLETED].includes(status);

  if (showVoucher) {
    return (
      <>
        <div className="phead">
          <div>
            <button className="btn ghost" onClick={() => setShowVoucher(false)}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Back to request
            </button>
            <h1 style={{ fontSize: 22, marginTop: 4 }}>Payment Voucher — {req.id}</h1>
          </div>
          <button className="btn sec" onClick={() => window.print()}>
            <Icon name="print" size={16} /> Print
          </button>
        </div>
        <VoucherTemplate req={req} data={data} />
      </>
    );
  }

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Financial Requests
            </button>
          </div>
          <h1 style={{ fontSize: 22, marginTop: 4 }}>{req.head ?? req.header}</h1>
        </div>
        <div className="row">
          {canPrint && (
            <button className="btn sec" onClick={() => setShowVoucher(true)}>
              <Icon name="print" size={15} /> View voucher
            </button>
          )}
        </div>
      </div>

      {/* Progress stepper */}
      <div className="card" style={{ padding: 'var(--s4) var(--s6)', marginBottom: 'var(--s4)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 640 }}>
          {FLOW_STEPS.map((step, i) => {
            const done = curStep > i && !rejected;
            const current = curStep === i && !rejected;
            return (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < FLOW_STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                    background: done ? 'var(--brand)' : current ? 'var(--brand)' : 'var(--border)',
                    color: done || current ? 'var(--on-brand)' : 'var(--ink-muted)',
                    boxShadow: current ? '0 0 0 3px var(--brand-subtle)' : 'none',
                  }}>
                    {done ? <Icon name="check" size={13} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: current ? 700 : 400, color: done || current ? 'var(--brand-text)' : 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
                    {step.label}
                  </span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? 'var(--brand)' : 'var(--border)', margin: '0 4px', marginBottom: 18 }} />
                )}
              </div>
            );
          })}
        </div>
        {rejected && (
          <div style={{
            marginTop: 'var(--s3)', background: 'var(--danger-subtle)', color: 'var(--danger)',
            borderRadius: 'var(--r-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="close" size={14} /> {status}
          </div>
        )}
        {status === STATUS.PAYMENT_COMPLETED && (
          <div style={{
            marginTop: 'var(--s3)', background: '#dcfce7', color: '#15803d',
            borderRadius: 'var(--r-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="check" size={14} /> Payment completed
          </div>
        )}
      </div>

      <div className="split">
        <div className="stack">
          {/* Tabs */}
          <div className="card flush">
            <div className="tabs">
              {['details', 'trail', 'comments'].map(t => (
                <button key={t} className={`tab ${activeTab === t ? 'on' : ''}`} onClick={() => setActiveTab(t)}>
                  {t === 'details' ? 'Details' : t === 'trail' ? 'Approval trail' : `Comments (${(req.comments ?? []).length})`}
                </button>
              ))}
            </div>

            <div style={{ padding: 'var(--s4)' }}>
              {activeTab === 'details' && (
                <div className="stack">
                  <dl className="kv">
                    <dt>Reference</dt><dd className="num">{req.id}</dd>
                    <dt>Status</dt>
                    <dd>
                      <span style={{
                        display: 'inline-block', borderRadius: 'var(--r-full)',
                        padding: '2px 10px', fontSize: 12, fontWeight: 600,
                        background: rejected ? 'var(--danger-subtle)' : status === STATUS.PAYMENT_COMPLETED ? '#dcfce7' : 'var(--brand-subtle)',
                        color: rejected ? 'var(--danger)' : status === STATUS.PAYMENT_COMPLETED ? '#15803d' : 'var(--brand-text)',
                      }}>{status}</span>
                    </dd>
                    <dt>Amount</dt><dd style={{ fontWeight: 700, fontSize: 15 }}>{naira(req.totalCost ?? req.amount)}</dd>
                    <dt>Department</dt><dd>{req.department ?? owner?.dept ?? '—'}</dd>
                    <dt>Submitted by</dt><dd>{owner?.name ?? '—'}</dd>
                    <dt>Date submitted</dt><dd>{req.created ? fdatetime(req.created) : '—'}</dd>
                    {req.account && <><dt>Account</dt><dd>{req.account}</dd></>}
                    {req.voucher && <><dt>Voucher no.</dt><dd className="num">{req.voucher}</dd></>}
                  </dl>
                  <div>
                    <div className="overline" style={{ marginBottom: 8 }}>Request details</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {req.requestText ?? req.details}
                    </p>
                  </div>
                  {req.supportingDocument && (
                    <div>
                      <div className="overline" style={{ marginBottom: 6 }}>Supporting document</div>
                      <a
                        href={req.supportingDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn sec"
                        style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13 }}
                      >
                        <Icon name="attach" size={14} />
                        {req.supportingDocumentName ?? 'View document'}
                      </a>
                    </div>
                  )}
                  {req.recommendation && (
                    <div style={{ background: 'var(--brand-subtle)', borderRadius: 'var(--r-md)', padding: 'var(--s3) var(--s4)' }}>
                      <div className="overline" style={{ marginBottom: 4 }}>HoD Recommendation</div>
                      <p style={{ margin: 0, fontSize: 14 }}>{req.recommendation}</p>
                    </div>
                  )}
                  {req.approval && (
                    <div style={{ background: '#dcfce7', borderRadius: 'var(--r-md)', padding: 'var(--s3) var(--s4)' }}>
                      <div className="overline" style={{ marginBottom: 4 }}>DG Approval note</div>
                      <p style={{ margin: 0, fontSize: 14 }}>{req.approval}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'trail' && (
                <ul className="log">
                  {(req.trail ?? []).map((t, i) => (
                    <li key={i}>
                      <div className="dot" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.role}</div>
                        <div className="small muted">{fdatetime(t.at)}</div>
                        {t.note && <div className="comment" style={{ marginTop: 4 }}>{t.note}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'comments' && (
                <div className="stack">
                  {(req.comments ?? []).length === 0 && <p className="muted small">No comments yet.</p>}
                  <ul className="log">
                    {(req.comments ?? []).map((c, i) => {
                      const author = data.staff.find(s => s.id === c.by);
                      return (
                        <li key={i}>
                          <div className="dot" />
                          <div>
                            <span style={{ fontWeight: 600 }}>{author?.name ?? '—'}</span>
                            <span className="muted small" style={{ marginLeft: 8 }}>{fdatetime(c.at)}</span>
                            <div className="comment" style={{ marginTop: 4 }}>{c.text}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="field">
                    <label>Add a comment</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment…" rows={3} />
                  </div>
                  <button className="btn sec" onClick={postComment} disabled={!comment.trim()}>
                    <Icon name="send" size={14} /> Post comment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action panel */}
          {action && (
            <div className="card">
              <h3>Your action</h3>
              <div className="row">
                <button className="btn pri" onClick={doAction} disabled={acting}>
                  <Icon name="check" size={16} /> {acting ? 'Saving…' : actionLabel(action)}
                </button>
                {action !== 'payment' && (
                  <button className="btn dan" onClick={() => setShowReject(v => !v)} disabled={acting}>
                    <Icon name="close" size={16} /> Reject
                  </button>
                )}
              </div>
              {actError && (
                <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{actError}</div>
              )}
              {showReject && (
                <div className="stack" style={{ marginTop: 'var(--s3)' }}>
                  <div className="field">
                    <label>Reason for rejection</label>
                    <textarea
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      placeholder="The originator will see this reason"
                      rows={3}
                    />
                  </div>
                  <button className="btn dan" onClick={doReject} disabled={!rejectNote.trim() || acting}>
                    {acting ? 'Saving…' : 'Confirm rejection'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: mini trail summary */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3>Approval trail</h3>
          <ul className="log">
            {(req.trail ?? []).map((t, i) => (
              <li key={i}>
                <div className="dot" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.role}</div>
                  <div className="small muted">{fdate(t.at)}</div>
                  {t.note && <div className="comment" style={{ marginTop: 4 }}>{t.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

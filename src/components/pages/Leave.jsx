import { useState } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api } from '../../api';
import Icon from '../ui/Icon';

const LEAVE_TYPES = ['Annual Leave', 'Casual Leave', 'Maternity Leave', 'Leave Of Absence', 'Sick Leave'];

const LEAVE_DAYS = { 'Annual Leave': 30, 'Casual Leave': 10, 'Sick Leave': 14, 'Maternity Leave': 90, 'Leave Of Absence': 0 };

const STATUS = {
  SUBMITTED:       'Submitted',
  APPROVED_HOD:    'Approved by HOD',
  REJECTED_HOD:    'Rejected by HOD',
  APPROVED_DG:     'Approved by DG',
  REJECTED_DG:     'Rejected by DG',
  APPROVED_ADMIN:  'Approved by Admin',
  REJECTED_ADMIN:  'Rejected by Admin',
};

const FLOW = ['Submitted', 'Approved by HOD', 'Approved by DG', 'Approved by Admin'];

function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);
}

function fdate(s) {
  if (!s) return '—';
  const d = new Date(s.length === 10 ? s + 'T00:00:00' : s);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isRejected(status) {
  return status === STATUS.REJECTED_HOD || status === STATUS.REJECTED_DG || status === STATUS.REJECTED_ADMIN;
}

function statusColor(status) {
  if (isRejected(status)) return { bg: 'var(--danger-subtle)', color: 'var(--danger)' };
  if (status === STATUS.APPROVED_ADMIN) return { bg: '#dcfce7', color: '#15803d' };
  if (status === STATUS.SUBMITTED) return { bg: 'var(--warning-subtle)', color: 'var(--warning)' };
  return { bg: 'var(--brand-subtle)', color: 'var(--brand-text)' };
}

function getAction(status, role, isAdminHOD = false) {
  if (status === STATUS.SUBMITTED && role === 'Department_Head') return 'hod_approve';
  if (status === STATUS.APPROVED_HOD && role === 'DG') return 'dg_approve';
  if (status === STATUS.APPROVED_DG && (role === 'Admin' || role === 'Administrator') && isAdminHOD) return 'admin_approve';
  return null;
}

function usedDays(leave, userId, type) {
  const year = new Date().getFullYear();
  return leave
    .filter(l => l.who === userId && l.type === type &&
      new Date(l.from).getFullYear() === year &&
      (l.status === STATUS.APPROVED_ADMIN || l.status === STATUS.APPROVED_DG))
    .reduce((sum, l) => sum + daysBetween(l.from, l.to), 0);
}

// ── Apply for Leave dialog ───────────────────────────────────────────────────
function ApplyDialog({ me, data, dispatch }) {
  const user = data.staff.find(s => s.id === me);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    type: 'Annual Leave',
    from: '',
    to: '',
    reason: '',
  });
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const days = daysBetween(form.from, form.to);
  const allowance = LEAVE_DAYS[form.type] ?? 0;
  const used = usedDays(data.leave, me, form.type);
  const remaining = Math.max(0, allowance - used);
  const exceedsBalance = allowance > 0 && days > remaining;

  const valid = form.type && form.from && form.to && form.from <= form.to && form.reason.trim() && !exceedsBalance;

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!valid) return;
    if (form.from < today) { setError('Start date cannot be in the past.'); return; }
    setSubmitting(true);
    try {
      const result = await api.post('/leave', {
        user: me,
        type: form.type,
        startDate: form.from,
        endDate: form.to,
        reason: form.reason.trim(),
        department: user?.dept ?? '',
        status: STATUS.SUBMITTED,
      });
      queryClient.invalidateQueries({ queryKey: KEYS.leave });
      dispatch({ type: 'CLOSE_DIALOG' });
      dispatch({ type: 'SHOW_TOAST', payload: `${form.type} application submitted` });
    } catch (err) {
      setError(err.message ?? 'Submission failed');
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
          width: 'min(520px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>Apply for Leave</h2>
          <button className="iconbtn" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}><Icon name="close" size={18} /></button>
        </div>

        <div className="stack">
          <div className="field">
            <label>Leave type <span style={{ color: 'var(--accent)' }}>*</span></label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Balance indicator */}
          {LEAVE_DAYS[form.type] > 0 && (
            <div style={{
              background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)',
              padding: 'var(--s3) var(--s4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span className="small" style={{ color: 'var(--ink-muted)' }}>
                {form.type} balance ({new Date().getFullYear()})
              </span>
              <span style={{ fontWeight: 700, fontSize: 14, color: remaining < 5 ? 'var(--danger)' : 'var(--ink)' }}>
                {remaining} / {LEAVE_DAYS[form.type]} days remaining
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
            <div className="field">
              <label>Start date <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input type="date" value={form.from} min={today} onChange={e => set('from', e.target.value)} />
            </div>
            <div className="field">
              <label>End date <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input type="date" value={form.to} min={form.from || today} onChange={e => set('to', e.target.value)} />
            </div>
          </div>

          {form.from && form.to && form.from <= form.to && (
            <div style={{
              background: exceedsBalance ? 'var(--danger-subtle)' : 'var(--brand-subtle)',
              color: exceedsBalance ? 'var(--danger)' : 'var(--brand-text)',
              borderRadius: 'var(--r-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600,
            }}>
              {days} working day{days !== 1 ? 's' : ''} ({fdate(form.from)} – {fdate(form.to)})
              {exceedsBalance && ` — exceeds your remaining balance of ${remaining} days`}
            </div>
          )}

          <div className="field">
            <label>Reason <span style={{ color: 'var(--accent)' }}>*</span></label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder="Brief reason for leave…"
            />
          </div>

          {error && (
            <div style={{ background: 'var(--danger-subtle)', color: 'var(--danger)', borderRadius: 'var(--r-md)', padding: '8px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end', marginTop: 'var(--s2)' }}>
            <button className="btn sec" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}>Cancel</button>
            <button className="btn pri" onClick={submit} disabled={!valid || submitting}>
              <Icon name="send" size={15} /> {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Leave detail / approval panel ────────────────────────────────────────────
function LeaveDetail({ lv, role, isAdminHOD, me, data, dispatch }) {
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState('');
  const applicant = data.staff.find(s => s.id === lv.who);
  const action = getAction(lv.status, role, isAdminHOD);
  const rejected = isRejected(lv.status);
  const days = daysBetween(lv.from, lv.to);
  const curStep = FLOW.indexOf(lv.status);

  const nextStatusMap = {
    hod_approve:   STATUS.APPROVED_HOD,
    dg_approve:    STATUS.APPROVED_DG,
    admin_approve: STATUS.APPROVED_ADMIN,
  };
  const rejectStatusMap = {
    hod_approve:   STATUS.REJECTED_HOD,
    dg_approve:    STATUS.REJECTED_DG,
    admin_approve: STATUS.REJECTED_ADMIN,
  };
  const actionLabel = {
    hod_approve:   'Approve & forward to DG',
    dg_approve:    'Approve & forward to Admin',
    admin_approve: 'Approve leave',
  };

  const refreshLeave = () => {
    queryClient.invalidateQueries({ queryKey: KEYS.leave });
  };

  const doApprove = async () => {
    setActing(true);
    setActError('');
    try {
      await api.put(`/leave/${lv.id}`, { status: nextStatusMap[action] });
      await refreshLeave();
      dispatch({ type: 'SHOW_TOAST', payload: 'Leave request approved' });
      dispatch({ type: 'SET_SEL', payload: null });
    } catch (err) {
      setActError(err.message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const doReject = async () => {
    if (!rejectNote.trim()) return;
    setActing(true);
    setActError('');
    try {
      await api.put(`/leave/${lv.id}`, { status: rejectStatusMap[action], note: rejectNote });
      await refreshLeave();
      dispatch({ type: 'SHOW_TOAST', payload: 'Leave request rejected' });
      setShowReject(false);
      dispatch({ type: 'SET_SEL', payload: null });
    } catch (err) {
      setActError(err.message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const sc = statusColor(lv.status);

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Leave
            </button>
          </div>
          <h1 style={{ fontSize: 22, marginTop: 4 }}>{lv.type} — {applicant?.name ?? '?'}</h1>
        </div>
        <span style={{ ...sc, borderRadius: 'var(--r-full)', padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>
          {lv.status}
        </span>
      </div>

      {/* Progress stepper */}
      <div className="card" style={{ padding: 'var(--s4) var(--s6)', marginBottom: 'var(--s4)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 400 }}>
          {FLOW.map((step, i) => {
            const done = curStep > i && !rejected;
            const current = curStep === i && !rejected;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < FLOW.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                    background: done ? 'var(--brand)' : current ? 'var(--brand)' : 'var(--border)',
                    color: done || current ? 'var(--on-brand)' : 'var(--ink-muted)',
                    boxShadow: current ? '0 0 0 3px var(--brand-subtle)' : 'none',
                  }}>
                    {done ? <Icon name="check" size={13} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: current ? 700 : 400, color: done || current ? 'var(--brand-text)' : 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
                    {step.replace('Approved by ', '')}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? 'var(--brand)' : 'var(--border)', margin: '0 4px', marginBottom: 18 }} />
                )}
              </div>
            );
          })}
        </div>
        {rejected && (
          <div style={{ marginTop: 'var(--s3)', background: 'var(--danger-subtle)', color: 'var(--danger)', borderRadius: 'var(--r-md)', padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>
            <Icon name="close" size={14} /> {lv.status}
          </div>
        )}
      </div>

      <div className="split">
        <div className="stack">
          <div className="card">
            <h3>Leave details</h3>
            <dl className="kv">
              <dt>Applicant</dt><dd>{applicant?.name ?? '—'}</dd>
              <dt>Department</dt><dd>{lv.department ?? applicant?.dept ?? '—'}</dd>
              <dt>Leave type</dt><dd><span className="tag">{lv.type}</span></dd>
              <dt>Start date</dt><dd>{fdate(lv.from)}</dd>
              <dt>End date</dt><dd>{fdate(lv.to)}</dd>
              <dt>Duration</dt><dd style={{ fontWeight: 700 }}>{days} day{days !== 1 ? 's' : ''}</dd>
              {lv.resumption && <><dt>Resumption</dt><dd>{fdate(lv.resumption)}</dd></>}
              <dt>Applied</dt><dd>{lv.created ? fdate(lv.created) : '—'}</dd>
            </dl>
            {lv.reason && (
              <div style={{ marginTop: 'var(--s3)' }}>
                <div className="overline" style={{ marginBottom: 6 }}>Reason</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{lv.reason}</p>
              </div>
            )}
          </div>

          {action && (
            <div className="card">
              <h3>Your action</h3>
              <div className="row">
                <button className="btn pri" onClick={doApprove} disabled={acting}>
                  <Icon name="check" size={16} /> {acting ? 'Saving…' : actionLabel[action]}
                </button>
                <button className="btn dan" onClick={() => setShowReject(v => !v)} disabled={acting}>
                  <Icon name="close" size={16} /> Reject
                </button>
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
                      placeholder="The applicant will see this reason"
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

        <div className="card" style={{ height: 'fit-content' }}>
          <h3>Approval trail</h3>
          <ul className="log">
            {(lv.trail ?? [{ role: 'owner', at: lv.created ?? new Date().toISOString(), note: 'Leave applied' }]).map((t, i) => (
              <li key={i}>
                <div className="dot" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.role}</div>
                  <div className="small muted">{new Date(t.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
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

// ── Leave balance cards ──────────────────────────────────────────────────────
function BalanceCards({ leave, userId }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--s4)', marginBottom: 'var(--s4)' }}>
      {['Annual Leave', 'Casual Leave', 'Sick Leave'].map(type => {
        const total = LEAVE_DAYS[type];
        const used = usedDays(leave, userId, type);
        const rem = Math.max(0, total - used);
        const pct = total ? Math.min(100, (used / total) * 100) : 0;
        const low = rem <= 3 && total > 0;
        return (
          <div key={type} className="card" style={{ padding: 'var(--s4)' }}>
            <div className="small muted" style={{ marginBottom: 4 }}>{type}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: low ? 'var(--danger)' : 'var(--ink)' }}>
              {rem}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-muted)' }}>/{total} days</span>
            </div>
            <div style={{ marginTop: 8, height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: low ? 'var(--danger)' : 'var(--brand)', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>{used} used</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Leave page ──────────────────────────────────────────────────────────
export default function Leave() {
  const { me, sel, dialog } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const isDG = user?.des === 'DG' || user?.role === 'DG';
  const isSuperRole = ['Admin', 'Administrator'].includes(user?.role ?? '');
  const role = isDG ? 'DG' : isSuperRole ? (user?.role ?? '') : user?.des === 'Department_Head' ? 'Department_Head' : (user?.role ?? '');
  const isSuper = isSuperRole || isDG;
  const isHOD = user?.des === 'Department_Head';
  const isAdminHOD = isSuperRole && isHOD && user?.dept === 'Admin';

  const [tab, setTab] = useState('mine');

  const selected = sel ? data.leave.find(l => l.id === sel) : null;
  if (selected) {
    return <LeaveDetail lv={selected} role={role} isAdminHOD={isAdminHOD} me={me} data={data} dispatch={dispatch} />;
  }

  // What to show per tab
  const visible = data.leave.filter(l => {
    if (tab === 'mine') return l.who === me;
    if (tab === 'team') {
      const owner = data.staff.find(s => s.id === l.who);
      return owner?.dept === user?.dept && l.who !== me;
    }
    // 'all' tab: DG sees only leaves awaiting their action; others see everything
    if (tab === 'all' && isDG) return l.status === STATUS.APPROVED_HOD;
    return true;
  });

  // Tabs available by role
  const tabs = [['mine', 'My applications']];
  if (isHOD && !isDG) tabs.push(['team', 'Team']);
  if (isDG || isSuper) tabs.push(['all', isDG ? 'Pending my approval' : 'All staff']);

  // Pending approvals count for badge
  const pendingAction = data.leave.filter(l => getAction(l.status, role, isAdminHOD)).length;

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">HR</span>
          <h1>Leave</h1>
        </div>
        <button className="btn pri" onClick={() => dispatch({ type: 'OPEN_DIALOG', payload: 'applyLeave' })}>
          <Icon name="plus" size={16} /> Apply for leave
        </button>
      </div>

      {/* Balance cards — only for own view */}
      {tab === 'mine' && <BalanceCards leave={data.leave} userId={me} />}

      <div className="card flush">
        <div className="tabs">
          {tabs.map(([k, l]) => (
            <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
              {l}
              {(k === 'team' || (k === 'all' && isDG)) && pendingAction > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--brand)', color: 'var(--on-brand)', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700, padding: '0 6px', lineHeight: '18px' }}>
                  {pendingAction}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th className="r">Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={6} className="empty">No leave applications found.</td></tr>
              )}
              {visible.map(l => {
                const applicant = data.staff.find(s => s.id === l.who);
                const days = daysBetween(l.from, l.to);
                const sc = statusColor(l.status);
                const canAct = !!getAction(l.status, role, isAdminHOD);
                return (
                  <tr key={l.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: l.id })}>
                    <td style={{ fontWeight: 600 }}>{applicant?.name ?? '—'}</td>
                    <td><span className="tag">{l.type}</span></td>
                    <td>{fdate(l.from)}</td>
                    <td>{fdate(l.to)}</td>
                    <td className="r num">{days}</td>
                    <td>
                      <span style={{ ...sc, display: 'inline-block', borderRadius: 'var(--r-full)', padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {l.status}
                        {canAct && ' ●'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dialog === 'applyLeave' && (
        <ApplyDialog me={me} data={data} dispatch={dispatch} />
      )}
    </>
  );
}

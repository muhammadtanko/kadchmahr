import { useState, useRef } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api, apiUpload } from '../../api';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

const STAGES = ['Draft', 'Pending dept head', 'Pending admin', 'Approved — pending report', 'Completed', 'Rejected'];
const STAGE_ROLES = ['owner', 'Department_Head', 'Admin', 'DG'];
const SUPER_ROLES = ['Administrator', 'Admin', 'DG'];
const ACT_TYPES = ['Training', 'Field', 'Workshop', 'Conference', 'Meeting', 'Monitoring', 'Other'];

const IST = { fontSize: 13, padding: '7px 10px', height: 34, width: '100%', boxSizing: 'border-box' };

function FW({ label, span, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: span ? '1 / -1' : undefined }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      {children}
    </label>
  );
}

function SH({ children }) {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brand-text)' }}>{children}</span>
    </div>
  );
}

// Keep old FieldLabel for ActivityDetail (unchanged)
function FieldLabel({ label, span, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: span ? '1 / -1' : undefined }}>
      <span style={{ font: '600 12px var(--sans)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      {children}
    </label>
  );
}

function fdate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function NewActivityDialog({ me, data, dispatch }) {
  const [form, setForm] = useState({ title: '', type: ACT_TYPES[0], startDate: '', endDate: '', location: '', desc: '', participants: [], reportOfficer: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const close = () => dispatch({ type: 'CLOSE_DIALOG' });

  const toggleParticipant = id => {
    setForm(f => {
      const next = f.participants.includes(id) ? f.participants.filter(p => p !== id) : [...f.participants, id];
      return { ...f, participants: next, reportOfficer: next.includes(f.reportOfficer) ? f.reportOfficer : '' };
    });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.startDate || !form.endDate || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const user = data.staff.find(s => s.id === me);
      const result = await api.post('/activities', {
        title: form.title.trim(),
        type: form.type,
        desc: form.desc.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location.trim(),
        department: user?.dept ?? '',
        owner: me,
        participants: form.participants,
        reportOfficer: form.reportOfficer || form.participants[0] || me,
        amount: parseFloat(form.amount) || 0,
      });
      queryClient.invalidateQueries({ queryKey: KEYS.activities });
      dispatch({ type: 'SHOW_TOAST', payload: `Activity "${form.title}" submitted` });
      close();
    } catch (err) {
      setSubmitError(err.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = form.title.trim() && form.startDate && form.endDate;
  const displayTitle = form.title.trim() || 'New Activity';
  const dateRange = form.startDate
    ? form.endDate && form.endDate !== form.startDate
      ? `${new Date(form.startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(form.endDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : new Date(form.startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={close}
    >
      <div
        style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(620px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Brand header ── */}
        <div style={{ background: 'var(--brand)', padding: '20px 24px', position: 'relative' }}>
          <button className="iconbtn" onClick={close} style={{ position: 'absolute', top: 14, right: 14, color: 'var(--on-brand)', opacity: 0.8 }}>
            <Icon name="close" size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={24} style={{ color: 'var(--on-brand)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--on-brand)' }}>{displayTitle}</div>
              <div style={{ fontSize: 13, color: 'var(--on-brand)', opacity: 0.75, marginTop: 2 }}>
                {form.type}{dateRange ? ` · ${dateRange}` : ''}
                {form.participants.length > 0 ? ` · ${form.participants.length} participant${form.participants.length !== 1 ? 's' : ''}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>

            <SH>Activity details</SH>
            <FW label="Title *" span>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Q4 Monitoring visit" style={IST} autoFocus />
            </FW>
            <FW label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value)} style={IST}>
                {ACT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FW>
            <FW label="Location">
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Venue / LGA" style={IST} />
            </FW>

            <FW label="Allowance per participant (₦)">
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="0" step="500" style={IST} />
            </FW>

            <SH>Schedule</SH>
            <FW label="Start date *">
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={IST} />
            </FW>
            <FW label="End date *">
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={IST} />
            </FW>
            <FW label="Description" span>
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                placeholder="Brief description of the activity"
                rows={3}
                style={{ ...IST, height: 'auto', resize: 'vertical' }}
              />
            </FW>

            <SH>People</SH>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Participants</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 6, maxHeight: 180, overflowY: 'auto', padding: 8, background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                {data.staff.filter(s => s.id !== me).map(s => {
                  const checked = form.participants.includes(s.id);
                  return (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, padding: '3px 4px', borderRadius: 4, background: checked ? 'var(--brand-subtle)' : 'transparent' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleParticipant(s.id)} style={{ accentColor: 'var(--brand)', flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-muted)', flexShrink: 0 }}>{s.dept}</span>
                    </label>
                  );
                })}
              </div>
              {form.participants.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-muted)' }}>
                  {form.participants.length} participant{form.participants.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {form.participants.length > 0 && (
              <FW label="Report officer" span>
                <select value={form.reportOfficer} onChange={e => set('reportOfficer', e.target.value)} style={IST}>
                  <option value="">Select a report officer…</option>
                  {form.participants.map(id => {
                    const s = data.staff.find(x => x.id === id);
                    return s ? <option key={id} value={id}>{s.name} — {s.dept}</option> : null;
                  })}
                </select>
              </FW>
            )}
          </div>

          {submitError && (
            <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{submitError}</div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={close} disabled={submitting}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!canSubmit || submitting}>
            <Icon name="plus" size={15} /> {submitting ? 'Submitting…' : 'Submit activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Activities() {
  const { me, sel, tab, dialog } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const isSuperRole = ['Admin', 'Administrator'].includes(user?.role ?? '');
  const role = ['Admin', 'Administrator', 'DG'].includes(user?.role ?? '') ? (user?.role ?? '') : user?.des === 'Department_Head' ? 'Department_Head' : (user?.role ?? '');
  const isSuper = SUPER_ROLES.includes(user?.role ?? '');
  const isAdminHOD = isSuperRole && user?.des === 'Department_Head' && user?.dept === 'Admin';

  const activeTab = tab ?? 'all';

  const filtered = data.activities.filter(a => {
    if (activeTab === 'mine') return a.owner === me || a.participants.includes(me);
    if (activeTab === 'pending') return a.stage > 0 && a.stage < 3;
    return true;
  });

  const selected = sel ? data.activities.find(a => a.id === sel) : null;

  if (selected) {
    return <ActivityDetail act={selected} role={role} isAdminHOD={isAdminHOD} me={me} data={data} dispatch={dispatch} isSuper={isSuper} />;
  }

  return (
    <>
      {dialog === 'newActivity' && <NewActivityDialog me={me} data={data} dispatch={dispatch} />}
      <div className="phead">
        <div>
          <span className="overline">Activities</span>
          <h1>Activities</h1>
        </div>
        <button className="btn pri" onClick={() => dispatch({ type: 'OPEN_DIALOG', payload: 'newActivity' })}>
          <Icon name="plus" size={16} /> New activity
        </button>
      </div>

      <div className="card flush">
        <div className="tabs">
          {[['all', 'All'], ['mine', 'Mine'], ['pending', 'Pending approval']].map(([k, l]) => (
            <button
              key={k}
              className={`tab ${activeTab === k ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', payload: k })}
            >{l}</button>
          ))}
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Title</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="empty">No activities found.</td></tr>
              )}
              {filtered.map(a => (
                <tr key={a.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: a.id })}>
                  <td className="num" style={{ fontWeight: 600 }}>{a.id}</td>
                  <td>{a.title}</td>
                  <td><span className="tag">{a.type}</span></td>
                  <td className="small muted">{fdate(a.startDate)} – {fdate(a.endDate)}</td>
                  <td><Pill status={STAGES[a.stage]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ActivityDetail({ act, role, isAdminHOD, me, data, dispatch, isSuper }) {
  const [comment, setComment] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState('');
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const reportRef = useRef();

  const currentRole = STAGE_ROLES[act.stage];
  const canAct = (
    (currentRole === 'Department_Head' && role === 'Department_Head') ||
    (currentRole === 'Admin' && (role === 'Admin' || role === 'Administrator') && isAdminHOD) ||
    (isSuper && act.stage > 0 && act.stage < 3)
  ) && act.stage > 0 && act.stage < 3 && act.status !== 'Rejected';

  const nextStageStatus = ['Draft', 'Pending dept head', 'Pending admin', 'Approved — pending report', 'Completed', 'Rejected'];

  const refreshActivities = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: KEYS.activities });
    } catch {}
  };

  const advance = async () => {
    const newStage = act.stage + 1;
    const newStatus = nextStageStatus[newStage] ?? 'Approved — pending report';
    setActing(true);
    setActError('');
    try {
      await api.put(`/activities/${act.id}`, { status: newStatus, actorRole: role });
      await refreshActivities();
      dispatch({ type: 'SHOW_TOAST', payload: 'Activity forwarded' });
      dispatch({ type: 'SET_SEL', payload: null });
    } catch (err) {
      setActError(err.message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (!rejectNote.trim()) return;
    setActing(true);
    setActError('');
    try {
      await api.put(`/activities/${act.id}`, { status: 'Rejected', note: rejectNote, actorRole: role });
      await refreshActivities();
      dispatch({ type: 'SHOW_TOAST', payload: 'Activity rejected' });
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
      await api.put(`/activities/${act.id}`, { commentText: comment.trim(), commentBy: me });
      await refreshActivities();
      setComment('');
    } catch {
            queryClient.invalidateQueries({ queryKey: KEYS.activities });
      setComment('');
    }
  };

  const isInvolved = act.owner === me || act.participants.includes(me) || act.reportOfficer === me;
  const canSubmitReport = me === act.reportOfficer && act.stage === 3;

  const submitReport = async (file) => {
    if (!file) return;
    setUploadingReport(true);
    setReportError('');
    try {
      const fd = new FormData();
      fd.append('report', file);
      fd.append('reportName', file.name);
      const result = await apiUpload(`/activities/${act.id}/report`, fd);
      await refreshActivities();
      dispatch({ type: 'SHOW_TOAST', payload: 'Report submitted successfully' });
    } catch (err) {
      setReportError(err.message ?? 'Upload failed');
    } finally {
      setUploadingReport(false);
      if (reportRef.current) reportRef.current.value = '';
    }
  };

  const participants = act.participants.map(id => data.staff.find(s => s.id === id)).filter(Boolean);

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Activities
            </button>
          </div>
          <h1 style={{ fontSize: 24 }}>{act.title}</h1>
        </div>
        <Pill status={STAGES[act.stage]} />
      </div>

      <div className="split">
        <div className="stack">
          <div className="card">
            <h3>Details</h3>
            <dl className="kv">
              <dt>Type</dt><dd><span className="tag">{act.type}</span></dd>
              <dt>Location</dt><dd>{act.location}</dd>
              <dt>Start</dt><dd>{act.startDate}</dd>
              <dt>End</dt><dd>{act.endDate}</dd>
              <dt>Description</dt><dd>{act.desc}</dd>
            </dl>
          </div>

          <div className="card">
            <h3>Participants</h3>
            <div className="stack" style={{ gap: 'var(--s2)' }}>
              {participants.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div className="small muted">{p.dept}</div>
                  </div>
                  {p.id === act.reportOfficer && <span className="tag gold">Report officer</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Report card — submit (report officer) or view (all involved) */}
          {(canSubmitReport || (isInvolved && act.report)) && (
            <div className="card">
              <h3>Activity Report</h3>

              {act.report && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: canSubmitReport ? 12 : 0 }}>
                  <Icon name="check" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.report.name}</div>
                    <div className="small muted">Report submitted</div>
                  </div>
                  <a href={act.report.url} target="_blank" rel="noopener noreferrer" className="btn sec" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none', flexShrink: 0 }}>
                    Download
                  </a>
                </div>
              )}

              {canSubmitReport && !act.report && (
                <div>
                  <p className="small muted" style={{ marginBottom: 10 }}>You are the report officer. Please upload the activity report to complete this activity.</p>
                  <input
                    type="file"
                    ref={reportRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={e => { const f = e.target.files?.[0]; if (f) submitReport(f); }}
                  />
                  <button
                    className="btn pri"
                    onClick={() => reportRef.current?.click()}
                    disabled={uploadingReport}
                  >
                    <Icon name="plus" size={15} /> {uploadingReport ? 'Uploading…' : 'Upload report'}
                  </button>
                  {reportError && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{reportError}</div>}
                </div>
              )}

              {canSubmitReport && act.report && (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="file"
                    ref={reportRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={e => { const f = e.target.files?.[0]; if (f) submitReport(f); }}
                  />
                  <button className="btn sec" style={{ fontSize: 12 }} onClick={() => reportRef.current?.click()} disabled={uploadingReport}>
                    {uploadingReport ? 'Uploading…' : 'Replace report'}
                  </button>
                  {reportError && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{reportError}</div>}
                </div>
              )}
            </div>
          )}

          {canAct && (
            <div className="card">
              <h3>Your action</h3>
              <div className="row">
                <button className="btn pri" onClick={advance} disabled={acting}>
                  <Icon name="check" size={16} /> {acting ? 'Saving…' : act.stage === 2 ? 'Approve' : 'Approve & forward'}
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
                      placeholder="The activity owner will see this reason"
                      rows={3}
                    />
                  </div>
                  <button className="btn dan" onClick={reject} disabled={!rejectNote.trim() || acting}>
                    {acting ? 'Saving…' : 'Confirm rejection'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3>Comments</h3>
            {act.comments.length === 0 && <p className="muted small">No comments yet.</p>}
            <ul className="log">
              {act.comments.map((c, i) => {
                const author = data.staff.find(s => s.id === c.by);
                return (
                  <li key={i}>
                    <div className="dot" />
                    <div>
                      <span style={{ fontWeight: 600 }}>{author?.name}</span>
                      <div className="comment" style={{ marginTop: 4 }}>{c.text}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="field">
              <label>Add a comment</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment" />
            </div>
            <button className="btn sec" onClick={postComment}>Post comment</button>
          </div>
        </div>

        <div className="card">
          <h3>Approval trail</h3>
          <ul className="log">
            {act.trail.map((t, i) => (
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

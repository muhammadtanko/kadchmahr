import { useState } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

function fdate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

function NewTicketDialog({ me, data, dispatch, onClose }) {
  const [form, setForm] = useState({ title: '', track: 'IT', desc: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const displayTitle = form.title.trim() || 'New Service Request';

  const submit = () => {
    if (!form.title.trim()) return;
    const newTicket = {
      id: 'SR-' + String(Math.floor(Math.random() * 9000) + 1000),
      track: form.track,
      title: form.title.trim(),
      desc: form.desc.trim(),
      by: me,
      status: 'Open',
      at: new Date().toISOString(),
      note: '',
      thread: [],
    };
    dispatch({ type: 'UPDATE_DATA', key: 'tickets', payload: [...data.tickets, newTicket] });
    dispatch({ type: 'SHOW_TOAST', payload: `Service request "${form.title}" submitted` });
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(520px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Brand header ── */}
        <div style={{ background: 'var(--brand)', padding: '20px 24px', position: 'relative' }}>
          <button className="iconbtn" onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, color: 'var(--on-brand)', opacity: 0.8 }}>
            <Icon name="close" size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={24} style={{ color: 'var(--on-brand)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--on-brand)' }}>{displayTitle}</div>
              <div style={{ fontSize: 13, color: 'var(--on-brand)', opacity: 0.75, marginTop: 2 }}>
                {form.track} · Support ticket
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
            <SH>Request details</SH>
            <FW label="Title *" span>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief description of the issue" style={IST} autoFocus />
            </FW>
            <FW label="Track" span>
              <select value={form.track} onChange={e => set('track', e.target.value)} style={IST}>
                <option value="IT">IT</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </FW>
            <FW label="Description" span>
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                placeholder="Provide more detail about the issue"
                rows={4}
                style={{ ...IST, height: 'auto', resize: 'vertical' }}
              />
            </FW>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!form.title.trim()}>
            <Icon name="plus" size={16} /> Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Service() {
  const { me, sel, tab } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const role = user?.role ?? '';
  const activeTab = tab ?? 'all';
  const [showNew, setShowNew] = useState(false);

  const tickets = data.tickets.filter(t => {
    if (activeTab === 'mine') return t.by === me;
    if (activeTab === 'it') return t.track === 'IT';
    if (activeTab === 'maintenance') return t.track === 'Maintenance';
    return true;
  });

  const selected = sel ? data.tickets.find(t => t.id === sel) : null;
  if (selected) {
    return <TicketDetail ticket={selected} role={role} me={me} data={data} dispatch={dispatch} />;
  }

  return (
    <>
      {showNew && <NewTicketDialog me={me} data={data} dispatch={dispatch} onClose={() => setShowNew(false)} />}
      <div className="phead">
        <div>
          <span className="overline">Support</span>
          <h1>Service Requests</h1>
        </div>
        <button className="btn pri" onClick={() => setShowNew(true)}>
          <Icon name="plus" size={16} /> New service request
        </button>
      </div>

      <div className="card flush">
        <div className="tabs">
          {[['all', 'All'], ['mine', 'Mine'], ['it', 'IT'], ['maintenance', 'Maintenance']].map(([k, l]) => (
            <button key={k} className={`tab ${activeTab === k ? 'on' : ''}`} onClick={() => dispatch({ type: 'SET_TAB', payload: k })}>{l}</button>
          ))}
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Title</th>
                <th>Track</th>
                <th>Submitted by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 && (
                <tr><td colSpan={5} className="empty">No tickets found.</td></tr>
              )}
              {tickets.map(t => {
                const submitter = data.staff.find(s => s.id === t.by);
                return (
                  <tr key={t.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: t.id })}>
                    <td className="num" style={{ fontWeight: 600 }}>{t.id}</td>
                    <td>{t.title}</td>
                    <td><span className="tag">{t.track}</span></td>
                    <td>{submitter?.name ?? '—'}</td>
                    <td><Pill status={t.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function TicketDetail({ ticket, role, me, data, dispatch }) {
  const [reply, setReply] = useState('');
  const [note, setNote] = useState(ticket.note);

  const submitter = data.staff.find(s => s.id === ticket.by);
  const isHandler = role === ticket.track;
  const isOwner = ticket.by === me;

  const resolve = () => {
    const updated = data.tickets.map(t =>
      t.id === ticket.id
        ? { ...t, status: 'Resolved', note, thread: [...t.thread, { who: me, text: `Resolved: ${note}`, at: new Date().toISOString() }] }
        : t
    );
    dispatch({ type: 'UPDATE_DATA', key: 'tickets', payload: updated });
    dispatch({ type: 'SHOW_TOAST', payload: 'Ticket marked as resolved' });
  };

  const postReply = () => {
    if (!reply.trim()) return;
    const updated = data.tickets.map(t =>
      t.id === ticket.id
        ? { ...t, thread: [...t.thread, { who: me, text: reply, at: new Date().toISOString() }] }
        : t
    );
    dispatch({ type: 'UPDATE_DATA', key: 'tickets', payload: updated });
    setReply('');
  };

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Service Requests
            </button>
          </div>
          <h1 style={{ fontSize: 22 }}>{ticket.title}</h1>
        </div>
        <Pill status={ticket.status} />
      </div>

      <div className="split">
        <div className="stack">
          <div className="card">
            <dl className="kv">
              <dt>Ticket ID</dt><dd className="num">{ticket.id}</dd>
              <dt>Track</dt><dd><span className="tag">{ticket.track}</span></dd>
              <dt>Submitted by</dt><dd>{submitter?.name}</dd>
              <dt>Date</dt><dd>{fdate(ticket.at)}</dd>
              <dt>Description</dt><dd>{ticket.desc}</dd>
            </dl>
          </div>

          {isHandler && ticket.status === 'In Progress' && (
            <div className="card">
              <h3>Mark as resolved</h3>
              <div className="field">
                <label>Resolution note</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Describe what was done" />
              </div>
              <button className="btn pri" onClick={resolve}>
                <Icon name="check" size={16} /> Mark resolved
              </button>
            </div>
          )}

          {(isHandler || isOwner) && ticket.status !== 'Closed' && (
            <div className="card">
              <h3>Thread</h3>
              <ul className="log">
                {ticket.thread.map((t, i) => {
                  const author = data.staff.find(s => s.id === t.who);
                  return (
                    <li key={i}>
                      <div className="dot" />
                      <div>
                        <span style={{ fontWeight: 600 }}>{author?.name ?? '—'}</span>
                        <span className="muted small" style={{ marginLeft: 8 }}>{fdate(t.at)}</span>
                        <div className="comment" style={{ marginTop: 4 }}>{t.text}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="field">
                <label>Reply</label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply" />
              </div>
              <button className="btn sec" onClick={postReply}>Post reply</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

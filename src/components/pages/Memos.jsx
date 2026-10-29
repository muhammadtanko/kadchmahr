import { useState, useRef } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api, apiUpload } from '../../api';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

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

function fdate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function invalidateMemos() {
  queryClient.invalidateQueries({ queryKey: KEYS.memos });
}

function InternalMemoDialog({ dispatch }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const close = () => dispatch({ type: 'CLOSE_DIALOG' });

  const submit = async () => {
    if (!subject.trim() || saving) return;
    setSaving(true); setErr('');
    try {
      await api.post('/memos/internal', { subject: subject.trim(), body: body.trim() });
      invalidateMemos();
      dispatch({ type: 'SHOW_TOAST', payload: 'Internal memo issued' });
      close();
    } catch (e) { setErr(e.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={close}>
      <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(560px,100%)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--brand)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="edit" size={22} style={{ color: 'var(--on-brand)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-brand)' }}>Internal Memo</div>
            <div style={{ fontSize: 12, color: 'var(--on-brand)', opacity: .75, marginTop: 2 }}>Visible to all staff</div>
          </div>
          <button className="iconbtn" onClick={close} style={{ color: 'var(--on-brand)', opacity: .8 }}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
          <SH>Memo details</SH>
          <FW label="Subject *" span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Staff update — Q4 review" style={IST} autoFocus />
          </FW>
          <FW label="Body" span>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write the memo content here…" rows={6}
              style={{ ...IST, height: 'auto', resize: 'vertical' }} />
          </FW>
          {err && <div style={{ gridColumn: '1/-1', color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={close} disabled={saving}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!subject.trim() || saving}>
            <Icon name="send" size={16} /> {saving ? 'Issuing…' : 'Issue memo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExternalMemoDialog({ dispatch }) {
  const [subject, setSubject] = useState('');
  const [org, setOrg] = useState('');
  const [received, setReceived] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);
  const close = () => dispatch({ type: 'CLOSE_DIALOG' });

  const submit = async () => {
    if (!subject.trim() || !org.trim() || saving) return;
    setSaving(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('subject', subject.trim());
      fd.append('org', org.trim());
      if (received) fd.append('received', received);
      if (file) { fd.append('file', file); fd.append('fileName', file.name); }
      await apiUpload('/memos/external', fd);
      invalidateMemos();
      dispatch({ type: 'SHOW_TOAST', payload: 'External memo uploaded' });
      close();
    } catch (e) { setErr(e.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={close}>
      <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(560px,100%)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--brand)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="attach" size={22} style={{ color: 'var(--on-brand)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-brand)' }}>External Memo</div>
            <div style={{ fontSize: 12, color: 'var(--on-brand)', opacity: .75, marginTop: 2 }}>Upload memo from an external organisation</div>
          </div>
          <button className="iconbtn" onClick={close} style={{ color: 'var(--on-brand)', opacity: .8 }}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
          <SH>Memo details</SH>
          <FW label="Subject *" span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Circular on new policy" style={IST} autoFocus />
          </FW>
          <FW label="Organisation *">
            <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Sending organisation" style={IST} />
          </FW>
          <FW label="Date received">
            <input type="date" value={received} onChange={e => setReceived(e.target.value)} style={IST} />
          </FW>
          <SH>Attachment</SH>
          <div style={{ gridColumn: '1/-1' }}>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] ?? null)} />
            <button className="btn sec" onClick={() => fileRef.current?.click()} style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
              <Icon name="attach" size={16} /> {file ? file.name : 'Choose file…'}
            </button>
            {file && (
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
                {file.name} · {(file.size / 1024).toFixed(1)} KB
                <button style={{ marginLeft: 8, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>Remove</button>
              </div>
            )}
          </div>
          {err && <div style={{ gridColumn: '1/-1', color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={close} disabled={saving}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!subject.trim() || !org.trim() || saving}>
            <Icon name="plus" size={16} /> {saving ? 'Uploading…' : 'Upload memo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Memos() {
  const { me, sel, tab, dialog } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const role = user?.role ?? '';
  const canManage = ['Administrator', 'Admin'].includes(role);
  const activeTab = tab ?? 'all';

  const filtered = data.memos.filter(m => {
    if (activeTab === 'internal') return m.type === 'Internal';
    if (activeTab === 'external') return m.type === 'External';
    return true;
  });

  const selected = sel ? data.memos.find(m => m.id === sel) : null;
  if (selected) {
    return <MemoDetail memo={selected} dispatch={dispatch} />;
  }

  return (
    <>
      {dialog === 'newInternal' && <InternalMemoDialog dispatch={dispatch} />}
      {dialog === 'newExternal' && <ExternalMemoDialog dispatch={dispatch} />}
      <div className="phead">
        <div>
          <span className="overline">Communication</span>
          <h1>Memos</h1>
        </div>
        {canManage && (
          <div className="row">
            <button className="btn sec" onClick={() => dispatch({ type: 'OPEN_DIALOG', payload: 'newInternal' })}>
              <Icon name="edit" size={16} /> Internal memo
            </button>
            <button className="btn pri" onClick={() => dispatch({ type: 'OPEN_DIALOG', payload: 'newExternal' })}>
              <Icon name="plus" size={16} /> External memo
            </button>
          </div>
        )}
      </div>

      <div className="card flush">
        <div className="tabs">
          {[['all', 'All'], ['internal', 'Internal'], ['external', 'External']].map(([k, l]) => (
            <button key={k} className={`tab ${activeTab === k ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', payload: k })}>{l}</button>
          ))}
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Subject</th>
                <th>From / Organisation</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="empty">No memos yet.</td></tr>}
              {filtered.map(m => (
                <tr key={m.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: m.id })}>
                  <td><Pill status={m.type} /></td>
                  <td style={{ fontWeight: 600 }}>{m.subject}</td>
                  <td className="muted">{m.type === 'External' ? m.org : (m.createdBy?.name || '—')}</td>
                  <td className="small muted">{fdate(m.at || m.received)}</td>
                  <td>{m.fileUrl && <Icon name="attach" size={14} style={{ color: 'var(--ink-muted)' }} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MemoDetail({ memo, dispatch }) {
  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Memos
            </button>
          </div>
          <h1 style={{ fontSize: 24 }}>{memo.subject}</h1>
        </div>
        <Pill status={memo.type} />
      </div>

      <div className="card">
        <dl className="kv">
          {memo.type === 'External' ? (
            <>
              <dt>Organisation</dt><dd>{memo.org || '—'}</dd>
              <dt>Date received</dt><dd>{fdate(memo.received)}</dd>
              <dt>Uploaded by</dt><dd>{memo.createdBy?.name || '—'}</dd>
              <dt>Upload date</dt><dd>{fdate(memo.at)}</dd>
            </>
          ) : (
            <>
              <dt>Issued by</dt><dd>{memo.createdBy?.name || '—'}</dd>
              <dt>Date issued</dt><dd>{fdate(memo.at)}</dd>
            </>
          )}
        </dl>

        {memo.body && (
          <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', padding: 'var(--s4)', fontSize: 14, lineHeight: '1.7', marginTop: 'var(--s4)', whiteSpace: 'pre-wrap' }}>
            {memo.body}
          </div>
        )}

        {memo.fileUrl && (
          <div style={{ marginTop: 'var(--s4)', display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--s3) var(--s4)', background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
            <Icon name="attach" size={18} style={{ color: 'var(--brand-text)', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{memo.fileName || 'Attachment'}</div>
            <a href={memo.fileUrl} target="_blank" rel="noreferrer" className="btn sec" style={{ textDecoration: 'none' }}>
              <Icon name="arrow_right" size={14} /> View / Download
            </a>
          </div>
        )}
      </div>
    </>
  );
}

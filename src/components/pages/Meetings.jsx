import { useState, useRef } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api, apiUpload } from '../../api';
import Icon from '../ui/Icon';

const MTG_TYPES = ['Management', 'General', 'Departmental', 'External', 'Committee'];

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

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve({ name: file.name, url: e.target.result });
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function ScheduleMeetingDialog({ me, data, dispatch, onClose }) {
  const myDept = data.staff.find(s => s.id === me)?.dept ?? '';
  const allStaffIds = data.staff.filter(s => s.id !== me).map(s => s.id);
  const hods = data.staff.filter(s => s.des === 'Department_Head');
  const hodIds = hods.map(s => s.id);
  const deptIds = data.staff.filter(s => s.id !== me && s.dept === myDept).map(s => s.id);

  const initParticipants = type => {
    if (type === 'Management') return hodIds;
    if (type === 'General') return allStaffIds;
    if (type === 'Departmental') return deptIds;
    return [];
  };

  const [form, setForm] = useState({ title: '', type: MTG_TYPES[0], date: '', time: '09:00', venue: '' });
  const [participants, setParticipants] = useState(() => initParticipants(MTG_TYPES[0]));
  const [minutes, setMinutes] = useState(null);
  const minutesRef = useRef();

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'type') setParticipants(initParticipants(v));
  };

  const toggle = id => setParticipants(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const pickMinutes = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await readFile(file);
    setMinutes(result);
    e.target.value = '';
  };

  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title.trim() || !form.date || saving) return;
    setSaving(true);
    try {
      const allParticipants = Array.from(new Set([me, ...participants]));
      const created = await api.post('/meetings', {
        title: form.title.trim(),
        type: form.type,
        meetingDate: form.date,
        time: form.time,
        venue: form.venue.trim(),
        participants: allParticipants,
        createdBy: me,
      });
      const mapped = mapMeeting(created);

      // If minutes attached, upload them
      if (minutes) {
        try {
          const fd = new FormData();
          const blob = await fetch(minutes.url).then(r => r.blob());
          fd.append('minutes', blob, minutes.name);
          fd.append('minutesName', minutes.name);
          await apiUpload(`/meetings/${mapped.id}/minutes`, fd);
        } catch {}
        queryClient.invalidateQueries({ queryKey: KEYS.meetings });
      } else {
        queryClient.invalidateQueries({ queryKey: KEYS.meetings });
      }

      dispatch({ type: 'SHOW_TOAST', payload: 'Meeting scheduled' });
      onClose();
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: err.message ?? 'Failed to schedule meeting' });
    } finally {
      setSaving(false);
    }
  };

  const displayTitle = form.title.trim() || 'New Meeting';
  const canSubmit = form.title.trim() && form.date;

  const isManagement = form.type === 'Management';
  const isGeneral = form.type === 'General';
  const isDepartmental = form.type === 'Departmental';
  const autoAll = isManagement || isGeneral || isDepartmental;

  // Sorted HODs first then rest
  const otherStaff = data.staff
    .filter(s => s.id !== me)
    .sort((a, b) => {
      const aHOD = a.des === 'Department_Head' ? 0 : 1;
      const bHOD = b.des === 'Department_Head' ? 0 : 1;
      return aHOD - bHOD || a.name.localeCompare(b.name);
    });

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(620px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Brand header ── */}
        <div style={{ background: 'var(--brand)', padding: '20px 24px', position: 'relative' }}>
          <button className="iconbtn" onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, color: 'var(--on-brand)', opacity: 0.8 }}>
            <Icon name="close" size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="calendar" size={24} style={{ color: 'var(--on-brand)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--on-brand)' }}>{displayTitle}</div>
              <div style={{ fontSize: 13, color: 'var(--on-brand)', opacity: 0.75, marginTop: 2 }}>
                {form.type}{form.date ? ` · ${new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                {participants.length > 0 ? ` · ${participants.length} attendee${participants.length !== 1 ? 's' : ''}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
            <SH>Meeting details</SH>
            <FW label="Title *" span>
              <input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Q4 Management review" style={IST} autoFocus />
            </FW>
            <FW label="Type">
              <select value={form.type} onChange={e => setField('type', e.target.value)} style={IST}>
                {MTG_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FW>
            <FW label="Venue">
              <input value={form.venue} onChange={e => setField('venue', e.target.value)} placeholder="Room / location" style={IST} />
            </FW>

            <SH>Date & Time</SH>
            <FW label="Date *">
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} style={IST} />
            </FW>
            <FW label="Time">
              <input type="time" value={form.time} onChange={e => setField('time', e.target.value)} style={IST} />
            </FW>

            {/* ── Attendees ── */}
            <SH>Attendees</SH>
            <div style={{ gridColumn: '1 / -1' }}>
              {autoAll && (
                <div style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--brand-subtle)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--brand-text)', fontWeight: 600 }}>
                  {isManagement
                    ? 'All Heads of Department are automatically invited to Management meetings'
                    : isGeneral
                    ? 'All staff are automatically invited to General meetings'
                    : `All ${myDept || 'department'} staff are automatically invited to Departmental meetings`}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, maxHeight: 200, overflowY: 'auto', padding: '8px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                {otherStaff.map(s => {
                  const isHOD = s.des === 'Department_Head';
                  const locked = isGeneral || (isManagement && isHOD) || (isDepartmental && s.dept === myDept);
                  const checked = participants.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: locked ? 'default' : 'pointer', fontSize: 13, padding: '3px 4px', borderRadius: 4, background: checked ? 'var(--brand-subtle)' : 'transparent' }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={locked}
                        onChange={() => !locked && toggle(s.id)}
                        style={{ accentColor: 'var(--brand)', flexShrink: 0 }}
                      />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                      {isHOD && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-text)', background: 'var(--brand-subtle)', borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>HOD</span>
                      )}
                    </label>
                  );
                })}
              </div>
              {participants.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-muted)' }}>
                  {participants.length} attendee{participants.length !== 1 ? 's' : ''} selected (+ you)
                </div>
              )}
            </div>

            {/* ── Meeting minutes ── */}
            <SH>Meeting minutes</SH>
            <div style={{ gridColumn: '1 / -1' }}>
              <input ref={minutesRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={pickMinutes} />
              {minutes ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                  <Icon name="document" size={16} style={{ color: 'var(--brand-text)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{minutes.name}</span>
                  <button className="btn ghost" style={{ fontSize: 12, padding: '3px 8px' }} onClick={() => setMinutes(null)}>Remove</button>
                  <button className="btn sec" style={{ fontSize: 12, padding: '3px 8px' }} onClick={() => minutesRef.current?.click()}>Replace</button>
                </div>
              ) : (
                <button
                  className="btn sec"
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                  onClick={() => minutesRef.current?.click()}
                >
                  <Icon name="upload" size={15} /> Attach meeting minutes (optional)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!canSubmit || saving}>
            <Icon name="plus" size={15} /> {saving ? 'Scheduling…' : 'Schedule meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetingCard({ m, onUploadMinutes }) {
  const fileRef = useRef();

  const handleFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await readFile(file);
    onUploadMinutes(m.id, result);
    e.target.value = '';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="tag">{m.type}</span>
        <span className="small muted">{m.time}</span>
      </div>
      <h3 style={{ fontSize: 16 }}>{m.title}</h3>
      <dl className="kv">
        <dt>Date</dt>
        <dd>{new Date(m.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</dd>
        {m.venue && <><dt>Venue</dt><dd>{m.venue}</dd></>}
        {m.participants?.length > 0 && <><dt>Attendees</dt><dd>{m.participants.length}</dd></>}
      </dl>

      {/* Minutes */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFile} />
        {m.minutes ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="document" size={14} style={{ color: 'var(--brand-text)', flexShrink: 0 }} />
            <a href={m.minutes.url} download={m.minutes.name} style={{ fontSize: 12, color: 'var(--brand-text)', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.minutes.name}
            </a>
            <button className="btn ghost" style={{ fontSize: 11, padding: '2px 7px' }} onClick={() => fileRef.current?.click()}>
              Replace
            </button>
          </div>
        ) : (
          <button className="btn sec" style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 13 }} onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={14} /> Upload minutes
          </button>
        )}
      </div>
    </div>
  );
}

export default function Meetings() {
  const { me } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const [showSchedule, setShowSchedule] = useState(false);

  const upcoming = [...data.meetings].sort((a, b) => a.date.localeCompare(b.date));

  const uploadMinutes = async (id, file) => {
    try {
      const fd = new FormData();
      const blob = await fetch(file.url).then(r => r.blob());
      fd.append('minutes', blob, file.name);
      fd.append('minutesName', file.name);
      await apiUpload(`/meetings/${id}/minutes`, fd);
      queryClient.invalidateQueries({ queryKey: KEYS.meetings });
      dispatch({ type: 'SHOW_TOAST', payload: 'Minutes uploaded' });
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: err.message ?? 'Failed to upload minutes' });
    }
  };

  return (
    <>
      {showSchedule && <ScheduleMeetingDialog me={me} data={data} dispatch={dispatch} onClose={() => setShowSchedule(false)} />}
      <div className="phead">
        <div>
          <span className="overline">Calendar</span>
          <h1>Meetings</h1>
        </div>
        <button className="btn pri" onClick={() => setShowSchedule(true)}>
          <Icon name="plus" size={16} /> Schedule meeting
        </button>
      </div>

      <div className="grid g2">
        {upcoming.map(m => (
          <MeetingCard key={m.id} m={m} onUploadMinutes={uploadMinutes} />
        ))}
        {upcoming.length === 0 && (
          <div className="card">
            <div className="empty">No upcoming meetings.</div>
          </div>
        )}
      </div>
    </>
  );
}

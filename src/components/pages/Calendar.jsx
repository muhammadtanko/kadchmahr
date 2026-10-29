import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Icon from '../ui/Icon';

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const EVENT_COLORS = {
  leave:    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  meeting:  { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  activity: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
};

function isoToDate(str) { return str ? new Date(str + 'T00:00:00') : null; }

function dateRange(from, to) {
  const dates = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function buildEventMap(data, me) {
  const map = {};

  const push = (date, event) => {
    if (!map[date]) map[date] = [];
    map[date].push(event);
  };

  // Determine what leave the current user can see
  const viewer = data.staff.find(s => s.id === me);
  const isAdminOrDG = ['Admin', 'Administrator', 'DG'].includes(viewer?.role ?? '') || viewer?.des === 'DG';
  const isHOD = viewer?.des === 'Department_Head';

  const APPROVED_STATUSES = ['Approved by Admin', 'Approved by DG', 'Approved by HOD', 'Approved'];
  data.leave.forEach(lv => {
    if (!APPROVED_STATUSES.includes(lv.status)) return;
    const staff = data.staff.find(s => s.id === lv.who);
    // Admin/DG: all staff; HOD: own dept; others: own leave only
    if (!isAdminOrDG && !isHOD && lv.who !== me) return;
    if (isHOD && !isAdminOrDG && lv.who !== me && staff?.dept !== viewer?.dept) return;
    dateRange(lv.from, lv.to).forEach(d => push(d, {
      kind: 'leave',
      id: lv.id,
      label: `${staff?.name ?? '?'} – ${lv.type}`,
      status: lv.status,
      from: lv.from,
      to: lv.to,
      who: staff?.name,
      type: lv.type,
    }));
  });

  // Meetings — show if no participants list (legacy), viewer is creator, or viewer is a participant
  data.meetings.forEach(m => {
    const hasParticipants = Array.isArray(m.participants) && m.participants.length > 0;
    if (hasParticipants && m.createdBy !== me && !m.participants.includes(me)) return;
    push(m.date, {
      kind: 'meeting',
      id: m.id,
      label: m.title,
      time: m.time,
      venue: m.venue,
      type: m.type,
    });
  });

  // Activities — only visible to the owner and listed participants
  data.activities.forEach(act => {
    if (!act.startDate) return;
    if (act.owner !== me && !act.participants.includes(me)) return;
    dateRange(act.startDate, act.endDate ?? act.startDate).forEach(d => push(d, {
      kind: 'activity',
      id: act.id,
      label: act.title,
      type: act.type,
      location: act.location,
      from: act.startDate,
      to: act.endDate,
    }));
  });

  return map;
}

function EventChip({ ev }) {
  const col = EVENT_COLORS[ev.kind];
  return (
    <div style={{
      background: col.bg,
      color: col.text,
      border: `1px solid ${col.border}`,
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      padding: '1px 5px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: '18px',
    }}>
      {ev.kind === 'meeting' && ev.time ? `${ev.time} ` : ''}
      {ev.label}
    </div>
  );
}

function DayDetail({ date, events, onClose }) {
  const d = isoToDate(date);
  const label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const kindLabel = { leave: 'Leave', meeting: 'Meeting', activity: 'Activity' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'var(--scrim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md)', padding: 'var(--s6)',
          minWidth: 340, maxWidth: 480, width: '90vw',
          maxHeight: '70vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s4)' }}>
          <div>
            <div className="overline">Events</div>
            <h3 style={{ marginTop: 2 }}>{label}</h3>
          </div>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        {events.length === 0 && <p className="muted small">No events on this day.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
          {events.map((ev, i) => {
            const col = EVENT_COLORS[ev.kind];
            return (
              <div key={i} style={{
                border: `1px solid ${col.border}`,
                background: col.bg,
                borderRadius: 'var(--r-md)',
                padding: 'var(--s3) var(--s4)',
              }}>
                <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{
                    background: col.border, color: col.text,
                    borderRadius: 'var(--r-full)', fontSize: 10, fontWeight: 700,
                    padding: '1px 8px', textTransform: 'uppercase',
                  }}>{kindLabel[ev.kind]}</span>
                  {ev.type && <span className="small muted">{ev.type}</span>}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{ev.label}</div>
                {ev.time && <div className="small muted" style={{ marginTop: 2 }}>Time: {ev.time}</div>}
                {ev.venue && <div className="small muted">Venue: {ev.venue}</div>}
                {ev.location && <div className="small muted">Location: {ev.location}</div>}
                {ev.who && <div className="small muted">Staff: {ev.who}</div>}
                {(ev.from && ev.to && ev.from !== ev.to) && (
                  <div className="small muted">Period: {ev.from} → {ev.to}</div>
                )}
                {ev.status && <div className="small muted">Status: {ev.status}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { me } = useApp();
  const data = useData();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const eventMap = buildEventMap(data, me);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const kindOrder = { meeting: 0, activity: 1, leave: 2 };

  const selectedDate = selected
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
    : null;

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Organisation</span>
          <h1>Calendar</h1>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap', marginBottom: 'var(--s4)' }}>
        {Object.entries(EVENT_COLORS).map(([kind, col]) => (
          <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: col.bg, border: `2px solid ${col.border}`, display: 'inline-block' }} />
            <span style={{ color: 'var(--ink)', textTransform: 'capitalize', fontWeight: 600 }}>{kind}</span>
          </div>
        ))}
      </div>

      <div className="card flush">
        {/* Month nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--s4) var(--s6)',
          borderBottom: '1px solid var(--border)',
        }}>
          <button className="btn sec" style={{ padding: '6px 12px' }} onClick={prev}>
            <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Prev
          </button>
          <h2 style={{ fontSize: 18, margin: 0 }}>{MONTHS[month]} {year}</h2>
          <button className="btn sec" style={{ padding: '6px 12px' }} onClick={next}>
            Next <Icon name="arrow_right" size={14} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          background: 'var(--surface-sunken)',
          borderBottom: '1px solid var(--border)',
        }}>
          {DAYS.map(d => (
            <div key={d} style={{
              padding: '8px 0', textAlign: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)',
              textTransform: 'uppercase', letterSpacing: '.05em',
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`e${idx}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', minHeight: 100, background: 'var(--surface-sunken)' }} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const events = (eventMap[dateStr] ?? []).sort((a, b) => (kindOrder[a.kind] ?? 9) - (kindOrder[b.kind] ?? 9));
            const isToday = dateStr === todayStr;
            const isSelected = selected === day;

            return (
              <div
                key={day}
                onClick={() => setSelected(day)}
                style={{
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  minHeight: 100,
                  padding: '6px 5px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--brand-subtle)' : 'var(--surface)',
                  transition: 'background 0.1s',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: isToday ? 'var(--brand)' : 'transparent',
                  color: isToday ? 'var(--on-brand)' : 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: isToday ? 700 : 400,
                  marginBottom: 4,
                }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {events.slice(0, 3).map((ev, i) => <EventChip key={i} ev={ev} />)}
                  {events.length > 3 && (
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', paddingLeft: 4 }}>
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && selectedDate && (
        <DayDetail
          date={selectedDate}
          events={eventMap[selectedDate] ?? []}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

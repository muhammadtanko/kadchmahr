import { useState, useEffect, useRef } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Icon from '../ui/Icon';

function ftime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const msgOverlay = { position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const msgBox = { background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', padding: 'var(--s6)', width: 'min(440px, 95vw)', maxHeight: '90vh', overflowY: 'auto' };

function MFL({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ font: '600 12px var(--sans)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      {children}
    </label>
  );
}

function NewMessageDialog({ me, data, dispatch, onClose }) {
  const others = data.staff.filter(s => s.id !== me);
  const [selectedId, setSelectedId] = useState(others[0]?.id ?? '');

  const submit = () => {
    if (!selectedId) return;
    const existing = data.convos.find(c => !c.group && c.members.includes(me) && c.members.includes(selectedId));
    if (existing) {
      dispatch({ type: 'SET_CHAT', payload: existing.id });
    } else {
      const newConvo = { id: 'c' + Date.now(), group: false, members: [me, selectedId], msgs: [] };
      dispatch({ type: 'UPDATE_DATA', key: 'convos', payload: [...data.convos, newConvo] });
      dispatch({ type: 'SET_CHAT', payload: newConvo.id });
    }
    onClose();
  };

  return (
    <div style={msgOverlay} onClick={onClose}>
      <div style={msgBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>New message</h2>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <MFL label="To">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {others.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </MFL>
        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end', marginTop: 'var(--s5)' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!selectedId}>Open chat</button>
        </div>
      </div>
    </div>
  );
}

function NewGroupDialog({ me, data, dispatch, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const others = data.staff.filter(s => s.id !== me);

  const submit = () => {
    if (!groupName.trim() || selected.length < 1) return;
    const newConvo = { id: 'c' + Date.now(), group: true, name: groupName.trim(), members: [me, ...selected], msgs: [] };
    dispatch({ type: 'UPDATE_DATA', key: 'convos', payload: [...data.convos, newConvo] });
    dispatch({ type: 'SET_CHAT', payload: newConvo.id });
    dispatch({ type: 'SHOW_TOAST', payload: `Group "${groupName}" created` });
    onClose();
  };

  return (
    <div style={msgOverlay} onClick={onClose}>
      <div style={msgBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>New group</h2>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', marginBottom: 'var(--s5)' }}>
          <MFL label="Group name *">
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Accounts team" />
          </MFL>
          <MFL label="Members">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--s2)', maxHeight: 160, overflowY: 'auto', padding: 'var(--s2)', background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              {others.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </MFL>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!groupName.trim() || selected.length < 1}>
            <Icon name="plus" size={16} /> Create group
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Messaging() {
  const { me, chat } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const [msg, setMsg] = useState('');
  const [showMsg, setShowMsg] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const msgsRef = useRef(null);

  const convos = data.convos.filter(c => c.members.includes(me));
  const activeConvo = chat ? data.convos.find(c => c.id === chat) : null;

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [activeConvo?.msgs.length]);

  const send = (e) => {
    e.preventDefault();
    if (!msg.trim() || !activeConvo) return;
    const updated = data.convos.map(c =>
      c.id === activeConvo.id
        ? { ...c, msgs: [...c.msgs, { from: me, text: msg.trim(), at: new Date().toISOString() }] }
        : c
    );
    dispatch({ type: 'UPDATE_DATA', key: 'convos', payload: updated });
    setMsg('');
  };

  const convoName = (c) => {
    if (c.group) return c.name;
    const other = c.members.find(id => id !== me);
    return data.staff.find(s => s.id === other)?.name ?? 'Unknown';
  };

  const convoInitials = (c) => {
    const n = convoName(c);
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const lastMsg = (c) => {
    if (!c.msgs.length) return '';
    const m = c.msgs[c.msgs.length - 1];
    return m.text ?? (m.file ? `📎 ${m.file}` : '');
  };

  return (
    <>
      {showMsg && <NewMessageDialog me={me} data={data} dispatch={dispatch} onClose={() => setShowMsg(false)} />}
      {showGroup && <NewGroupDialog me={me} data={data} dispatch={dispatch} onClose={() => setShowGroup(false)} />}
      <div className="phead">
        <div>
          <span className="overline">Communication</span>
          <h1>Messaging</h1>
        </div>
        <div className="row">
          <button className="btn sec" onClick={() => setShowMsg(true)}>
            <Icon name="plus" size={16} /> New message
          </button>
          <button className="btn sec" onClick={() => setShowGroup(true)}>
            <Icon name="group" size={16} /> New group
          </button>
        </div>
      </div>

      <div className="card flush" style={{ overflow: 'hidden' }}>
        <div className="chat" style={{ height: 'min(640px, calc(100vh - 220px))', minHeight: 440 }}>
          {/* Conversation list */}
          <div className="convs" style={{ borderRight: '1px solid var(--border)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {convos.map(c => (
              <button
                key={c.id}
                className={`conv ${chat === c.id ? 'on' : ''}`}
                onClick={() => dispatch({ type: 'SET_CHAT', payload: c.id })}
                style={{
                  display: 'flex', gap: 'var(--s3)', padding: 'var(--s3) var(--s4)',
                  border: 0, borderBottom: '1px solid var(--border)',
                  background: chat === c.id ? 'var(--brand-subtle)' : 'none',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sans)', color: 'var(--ink)', width: '100%',
                }}
              >
                <div className="avatar" style={{ background: 'var(--brand-subtle)', color: 'var(--on-brand-subtle)', flexShrink: 0 }}>
                  {convoInitials(c)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{convoName(c)}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMsg(c)}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Thread */}
          {activeConvo ? (
            <div className="thread" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                {convoName(activeConvo)}
              </div>
              <div
                ref={msgsRef}
                className="msgs"
                style={{ flex: 1, overflow: 'auto', padding: 'var(--s4) var(--s6)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)', background: 'var(--surface-sunken)' }}
              >
                {activeConvo.msgs.map((m, i) => (
                  <div key={i} className={`msg ${m.from === me ? 'me' : ''}`} style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', gap: 2, alignSelf: m.from === me ? 'flex-end' : 'flex-start', alignItems: m.from === me ? 'flex-end' : 'flex-start' }}>
                    {activeConvo.group && m.from !== me && (
                      <span className="small muted">{data.staff.find(s => s.id === m.from)?.name}</span>
                    )}
                    <div className="bub" style={{
                      background: m.from === me ? 'var(--brand)' : 'var(--surface-raised)',
                      color: m.from === me ? 'var(--on-brand)' : 'var(--ink)',
                      border: `1px solid ${m.from === me ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-md)', padding: 'var(--s2) var(--s3)',
                      wordBreak: 'break-word',
                    }}>
                      {m.text}
                    </div>
                    <span className="small muted">{ftime(m.at)}</span>
                  </div>
                ))}
              </div>
              <form className="composer" onSubmit={send} style={{ display: 'flex', gap: 'var(--s2)', padding: 'var(--s3) var(--s4)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <input
                  type="text"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Write a message"
                  autoComplete="off"
                  style={{ flex: 1 }}
                />
                <button className="btn pri" type="submit">
                  <Icon name="send" size={16} /> Send
                </button>
              </form>
            </div>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              Choose a conversation or start a new one.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

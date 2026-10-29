import { useState } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

const CATS = ['Computer', 'Vehicle', 'Furniture', 'Equipment'];
const CONDS = ['Good', 'Fair', 'Damaged'];

const modalOverlay = { position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalBox = { background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', padding: 'var(--s6)', width: 'min(520px, 95vw)', maxHeight: '90vh', overflowY: 'auto' };

function FL({ label, span, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: span ? '1 / -1' : undefined }}>
      <span style={{ font: '600 12px var(--sans)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      {children}
    </label>
  );
}

function AddAssetDialog({ data, dispatch, onClose }) {
  const blank = { name: '', cat: CATS[0], sn: '', cond: CONDS[0], bought: '', value: '' };
  const [form, setForm] = useState(blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return;
    const prefixMap = { Computer: 'ICT', Vehicle: 'VEH', Furniture: 'FUR', Equipment: 'EQP' };
    const prefix = prefixMap[form.cat] ?? 'GEN';
    const num = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
    const tag = `KCH/${prefix}/${num}`;
    const newAsset = { tag, name: form.name.trim(), cat: form.cat, sn: form.sn.trim() || '—', bought: form.bought, value: Number(form.value) || 0, cond: form.cond, to: null, hist: [] };
    dispatch({ type: 'UPDATE_DATA', key: 'assets', payload: [...data.assets, newAsset] });
    dispatch({ type: 'SHOW_TOAST', payload: `${form.name} added to assets` });
    onClose();
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>Add asset</h2>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3) var(--s4)', marginBottom: 'var(--s5)' }}>
          <FL label="Name *" span><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. HP EliteBook 840" /></FL>
          <FL label="Category">
            <select value={form.cat} onChange={e => set('cat', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FL>
          <FL label="Condition">
            <select value={form.cond} onChange={e => set('cond', e.target.value)}>
              {CONDS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FL>
          <FL label="Serial number"><input value={form.sn} onChange={e => set('sn', e.target.value)} placeholder="—" /></FL>
          <FL label="Purchase date"><input type="date" value={form.bought} onChange={e => set('bought', e.target.value)} /></FL>
          <FL label="Purchase value (₦)"><input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0" min="0" /></FL>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!form.name.trim()}>
            <Icon name="plus" size={16} /> Add asset
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueToStaffDialog({ asset, data, dispatch, me, onClose }) {
  const activeStaff = data.staff.filter(s => s.status === 'Active');
  const [selectedId, setSelectedId] = useState(activeStaff[0]?.id ?? '');

  const submit = () => {
    if (!selectedId) return;
    const updated = data.assets.map(a =>
      a.tag === asset.tag
        ? { ...a, to: selectedId, hist: [...a.hist, { u: selectedId, out: new Date().toISOString().slice(0, 10), by: me }] }
        : a
    );
    const staff = data.staff.find(s => s.id === selectedId);
    dispatch({ type: 'UPDATE_DATA', key: 'assets', payload: updated });
    dispatch({ type: 'SHOW_TOAST', payload: `${asset.name} issued to ${staff?.name}` });
    onClose();
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={{ ...modalBox, width: 'min(380px, 95vw)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>Issue to staff</h2>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <FL label="Staff member">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {activeStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FL>
        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end', marginTop: 'var(--s5)' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!selectedId}>
            <Icon name="person" size={16} /> Issue asset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Assets() {
  const { me, sel } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const assets = data.assets.filter(a => {
    if (filter) return a.cat === filter;
    return true;
  });

  const selected = sel ? data.assets.find(a => a.tag === sel) : null;
  if (selected) {
    return <AssetDetail asset={selected} data={data} dispatch={dispatch} me={me} />;
  }

  return (
    <>
      {showAdd && <AddAssetDialog data={data} dispatch={dispatch} onClose={() => setShowAdd(false)} />}
      <div className="phead">
        <div>
          <span className="overline">Store</span>
          <h1>Assets</h1>
        </div>
        <button className="btn pri" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={16} /> Add asset
        </button>
      </div>

      <div className="card flush">
        <div className="chead">
          <div className="filters">
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="">Category: all</option>
              {['Computer', 'Vehicle', 'Furniture', 'Equipment'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Issued to</th>
                <th className="r">Value (₦)</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const issuedTo = a.to ? data.staff.find(s => s.id === a.to) : null;
                return (
                  <tr key={a.tag} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: a.tag })}>
                    <td className="num" style={{ fontWeight: 600 }}>{a.tag}</td>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td><span className="tag">{a.cat}</span></td>
                    <td><Pill status={a.cond} /></td>
                    <td>{issuedTo?.name ?? <span className="muted">—</span>}</td>
                    <td className="r num">{naira(a.value)}</td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr><td colSpan={6} className="empty">No assets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AssetDetail({ asset, data, dispatch, me }) {
  const issuedTo = asset.to ? data.staff.find(s => s.id === asset.to) : null;
  const [showIssue, setShowIssue] = useState(false);

  return (
    <>
      {showIssue && <IssueToStaffDialog asset={asset} data={data} dispatch={dispatch} me={me} onClose={() => setShowIssue(false)} />}
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Assets
            </button>
          </div>
          <h1 style={{ fontSize: 24 }}>{asset.name}</h1>
        </div>
        <Pill status={asset.cond} />
      </div>

      <div className="split">
        <div className="card">
          <dl className="kv">
            <dt>Asset tag</dt><dd className="num">{asset.tag}</dd>
            <dt>Category</dt><dd><span className="tag">{asset.cat}</span></dd>
            <dt>Serial number</dt><dd>{asset.sn}</dd>
            <dt>Purchase date</dt><dd>{asset.bought}</dd>
            <dt>Purchase value</dt><dd className="num">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(asset.value)}</dd>
            <dt>Currently issued to</dt><dd>{issuedTo?.name ?? '—'}</dd>
          </dl>
          {!asset.to && (
            <button className="btn sec" onClick={() => setShowIssue(true)}>
              <Icon name="person" size={16} /> Issue to staff
            </button>
          )}
        </div>

        <div className="card">
          <h3>Issue history</h3>
          {asset.hist.length === 0 && <p className="muted small">Never issued.</p>}
          <ul className="log">
            {asset.hist.map((h, i) => {
              const recipient = data.staff.find(s => s.id === h.u);
              const issuedBy = data.staff.find(s => s.id === h.by);
              return (
                <li key={i}>
                  <div className="dot" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Issued to {recipient?.name}</div>
                    <div className="small muted">On {h.out} by {issuedBy?.name}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api } from '../../api';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';
import * as XLSX from 'xlsx';

const STAGES = ['Pending Administrator', 'Pending DG', 'Approved — pending payment', 'Completed'];
const STAGE_ROLES = ['Administrator', 'DG', 'Accounts'];
const SUPER_ROLES = ['Administrator', 'Admin', 'DG'];
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

function NewPayrollDialog({ me, data, dispatch }) {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const activeStaff = data.staff.filter(s => s.status === 'Active');
  const total = activeStaff.reduce((a, s) => a + (s.gross || 0), 0);

  const submit = async () => {
    const period = year + '-' + month;
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const lines = activeStaff.map(s => ({ uid: s.id, name: s.name, dept: s.dept, des: s.des, rank: s.rank, gross: s.gross || 0 }));
      const trail = [{ role: 'Accounts', at: new Date().toISOString(), note: 'Payroll run created' }];
      await api.post('/payroll', { period, lines, trail });
      queryClient.invalidateQueries({ queryKey: KEYS.payroll });
      dispatch({ type: 'SHOW_TOAST', payload: `Payroll run PAY-${period} created` });
      dispatch({ type: 'CLOSE_DIALOG' });
    } catch (err) {
      setSaveError(err.message ?? 'Failed to create payroll run');
    } finally {
      setSaving(false);
    }
  };

  const F = ({ label, children }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ font: '600 12px var(--sans)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      {children}
    </label>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}>
      <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', padding: 'var(--s6)', width: 'min(420px,95vw)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>New payroll run</h2>
          <button className="iconbtn" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3) var(--s4)', marginBottom: 'var(--s4)' }}>
          <F label="Month">
            <select value={month} onChange={e => setMonth(e.target.value)}>
              {MONTHS.map((m, i) => <option key={m} value={m}>{MONTH_LABELS[i]}</option>)}
            </select>
          </F>
          <F label="Year">
            <select value={year} onChange={e => setYear(e.target.value)}>
              {['2024','2025','2026','2027','2028','2029','2030'].map(y => <option key={y}>{y}</option>)}
            </select>
          </F>
        </div>
        <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', padding: 'var(--s3) var(--s4)', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 'var(--s5)' }}>
          {activeStaff.length} active staff · Total gross {naira(total)}
        </div>
        {saveError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{saveError}</div>}
        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={() => dispatch({ type: 'CLOSE_DIALOG' })} disabled={saving}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={saving}><Icon name="plus" size={16} /> {saving ? 'Creating…' : 'Create run'}</button>
        </div>
      </div>
    </div>
  );
}

const APPROVAL_ROLES = ['Accounts', 'Administrator', 'Admin', 'DG'];

function MyPayView({ me, data }) {
  // All payroll runs where this staff member appears (any stage)
  const meStr = String(me ?? '');
  const mySalaryRows = data.payroll
    .filter(p => p.lines.some(l => String(l.uid) === meStr))
    .map(p => {
      const line = p.lines.find(l => String(l.uid) === meStr);
      const lastTrail = p.trail.at(-1);
      return {
        id: `pay-${p.id}`,
        label: `PAY-${p.period}`,
        category: 'Salary',
        amount: line?.gross ?? 0,
        at: lastTrail?.at ?? '',
        status: STAGES[p.stage] ?? 'Completed',
        released: p.stage === 3,
      };
    });

  const myActivityRows = data.activities
    .filter(a => a.amount > 0 && (String(a.owner) === meStr || a.participants.some(p => String(p) === meStr)))
    .map(a => ({
      id: `act-${a.id}`,
      label: a.title,
      category: 'Activity allowance',
      amount: a.amount,
      at: a.endDate ?? '',
      status: a.status,
      released: a.status === 'Completed',
    }));

  const rows = [...mySalaryRows, ...myActivityRows]
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));

  const totalReleased = mySalaryRows.filter(r => r.released).reduce((s, r) => s + r.amount, 0);
  const totalActivity = myActivityRows.filter(r => r.released).reduce((s, r) => s + r.amount, 0);
  const totalPending  = [...mySalaryRows, ...myActivityRows].filter(r => !r.released).reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Finance</span>
          <h1>My Pay</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        {[
          { label: 'Salary received', value: naira(totalReleased) },
          { label: 'Activity allowances received', value: naira(totalActivity) },
          { label: 'Pending payment', value: naira(totalPending) },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: 'var(--s4)' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card flush">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th className="r">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="empty">No payroll records yet.</td></tr>}
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.label}</td>
                  <td><Pill status={r.category} /></td>
                  <td><Pill status={r.status} /></td>
                  <td>{r.at ? new Date(r.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="r num">{naira(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function Payroll() {
  const { me, sel, dialog } = useApp();
  const data = useData();
  const dispatch = useDispatch();
  const user = data.staff.find(s => s.id === me);
  const role = user?.role ?? '';
  const isSuper = SUPER_ROLES.includes(role);
  const isApprovalRole = APPROVAL_ROLES.includes(role);
  const [viewMode, setViewMode] = useState('runs');

  useEffect(() => {
    refreshPayroll();
  }, []);

  const selected = sel ? data.payroll.find(p => p.id === sel) : null;

  if (selected) {
    return <PayrollDetail run={selected} role={role} me={me} data={data} dispatch={dispatch} isSuper={isSuper} />;
  }

  // Regular staff see only their personal pay history
  if (!isApprovalRole) {
    return <MyPayView me={me} data={data} />;
  }

  // Approval roles get a tab switcher: Runs | My Pay
  const canCreate = ['Accounts', 'Administrator', 'Admin'].includes(role);

  return (
    <>
      {dialog === 'newPayroll' && <NewPayrollDialog me={me} data={data} dispatch={dispatch} />}
      <div className="phead">
        <div>
          <span className="overline">Finance</span>
          <h1>Payroll</h1>
        </div>
        <div className="row" style={{ gap: 'var(--s2)' }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            {['runs', 'mypay'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600, background: viewMode === v ? 'var(--brand)' : 'transparent', color: viewMode === v ? 'var(--on-brand)' : 'var(--ink-muted)', border: 'none', cursor: 'pointer' }}>
                {v === 'runs' ? 'Payroll runs' : 'My pay'}
              </button>
            ))}
          </div>
          {canCreate && viewMode === 'runs' && (
            <button className="btn pri" onClick={() => dispatch({ type: 'OPEN_DIALOG', payload: 'newPayroll' })}>
              <Icon name="plus" size={16} /> New payroll run
            </button>
          )}
        </div>
      </div>

      {viewMode === 'mypay' ? <MyPayView me={me} data={data} /> : (
        <div className="card flush">
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Period</th>
                  <th>Staff count</th>
                  <th>Status</th>
                  <th className="r">Total (₦)</th>
                </tr>
              </thead>
              <tbody>
                {data.payroll.length === 0 && (
                  <tr><td colSpan={5} className="empty">No payroll runs yet.</td></tr>
                )}
                {data.payroll.map(p => {
                  const total = p.lines.reduce((a, l) => a + l.gross, 0);
                  return (
                    <tr key={p.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: p.id })}>
                      <td className="num" style={{ fontWeight: 600 }}>{p.id}</td>
                      <td>{p.period}</td>
                      <td>{p.lines.length}</td>
                      <td><Pill status={STAGES[p.stage] ?? 'Completed'} /></td>
                      <td className="r num">{naira(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

const refreshPayroll = () => {
  queryClient.invalidateQueries({ queryKey: KEYS.payroll });
};

function PayrollDetail({ run, role, me, data, dispatch, isSuper }) {
  const [editMode, setEditMode] = useState(false);
  const [lines, setLines] = useState(run.lines);
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState('');
  const total = lines.reduce((a, l) => a + l.gross, 0);
  const status = STAGES[run.stage] ?? 'Approved';
  const currentRole = STAGE_ROLES[run.stage];
  const roleMatches = currentRole === role || (currentRole === 'Administrator' && role === 'Admin');
  const canAct = roleMatches && run.stage < 3;
  const canEdit = role === 'Accounts' && run.stage === 0;

  const DESIG = { DG: 'Director General', DD: 'Deputy Director', AD: 'Assistant Director', SHO: 'Senior Health Officer', HO: 'Health Officer', AO: 'Admin Officer', SA: 'Senior Accountant', AC: 'Accountant', AS: 'Admin Secretary', DO: 'Data Officer', IT: 'IT Officer', DR: 'Driver', ST: 'Store Officer', MA: 'Maintenance Officer' };

  const exportExcel = () => {
    const rows = lines.map(l => {
      const staff = data.staff.find(s => s.id === l.uid) ?? {};
      return {
        'Full Name':       l.name,
        'Department':      l.dept,
        'Bank Name':       staff.bankName || '—',
        'Account Number':  staff.bankAccountNumber || '—',
        'Gross Pay (₦)':  l.gross,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, `PAY-${run.period}.xlsx`);
  };

  const saveLines = async () => {
    try {
      await api.put(`/payroll/${run.id}`, { lines });
      refreshPayroll();
      setEditMode(false);
      dispatch({ type: 'SHOW_TOAST', payload: 'Payroll lines saved' });
    } catch (err) {
      setActError(err.message ?? 'Save failed');
    }
  };

  const advance = async () => {
    setActing(true);
    setActError('');
    try {
      await api.put(`/payroll/${run.id}`, { stage: run.stage + 1, role, note: '' });
      refreshPayroll();
      dispatch({ type: 'SHOW_TOAST', payload: 'Payroll run forwarded' });
      dispatch({ type: 'SET_SEL', payload: null });
    } catch (err) {
      setActError(err.message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Payroll
            </button>
          </div>
          <h1 style={{ fontSize: 24 }}>Payroll run — {run.period}</h1>
        </div>
        <div className="row">
          <Pill status={status} />
          {canEdit && (
            <button className="btn sec" onClick={() => editMode ? saveLines() : setEditMode(true)}>
              <Icon name="edit" size={16} /> {editMode ? 'Save amounts' : 'Edit amounts'}
            </button>
          )}
          {role === 'Accounts' && (
            <button className="btn sec" onClick={exportExcel}>
              <Icon name="check" size={16} /> Export Excel
            </button>
          )}
        </div>
      </div>

      <div className="card flush">
        <div className="chead">
          <h3>Staff payroll lines</h3>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>PSN</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th className="r">Gross Pay (₦)</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.uid}>
                  <td className="num">{data.staff.find(s => s.id === l.uid)?.psn ?? '—'}</td>
                  <td style={{ fontWeight: 600 }}>{l.name}</td>
                  <td>{l.dept}</td>
                  <td>
                    {DESIG[l.des] || l.des}
                    <div className="small muted">{l.rank}</div>
                  </td>
                  <td className="r num">
                    {editMode ? (
                      <input
                        className="cell"
                        type="number"
                        value={l.gross}
                        min="0"
                        step="500"
                        onChange={e => {
                          const newLines = lines.map((x, j) => j === i ? { ...x, gross: +e.target.value } : x);
                          setLines(newLines);
                        }}
                      />
                    ) : naira(l.gross)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Grand total · {lines.length} staff</td>
                <td className="r num">{naira(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {canAct && (
        <div className="card">
          <h3>Your action</h3>
          <button className="btn pri" onClick={advance} disabled={acting}>
            <Icon name="check" size={16} />
            {acting ? 'Saving…' : run.stage === 1 ? 'Approve payroll' : run.stage === 2 ? 'Confirm payment released' : 'Approve & forward'}
          </button>
          {actError && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{actError}</div>}
        </div>
      )}

      <div className="card">
        <h3>Approval trail</h3>
        <ul className="log">
          {run.trail.map((t, i) => (
            <li key={i}>
              <div className="dot" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.role}</div>
                <div className="small muted">{new Date(t.at).toLocaleDateString('en-GB')}</div>
                {t.note && <div className="comment" style={{ marginTop: 4 }}>{t.note}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

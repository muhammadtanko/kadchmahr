import { useState } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';
import { RATE } from '../../data/mockData';

const STAGES = ['Pending Accounts', 'Pending DAF', 'Pending Audit', 'Pending DG Approval', 'Approved'];
const STAGE_ROLES = ['Accounts', 'DAF', 'Auditor', 'DG'];
const FLOW = ['Generated', 'Accounts', 'DAF', 'Audit', 'DG Approved'];

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

function fdate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function periodLabel(p) {
  const [y, m] = p.split('-');
  return new Date(+y, +m - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// ── Number to words ──────────────────────────────────────────────────────────
function toWords(n) {
  if (n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function below1000(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + below1000(num % 100) : '');
  }
  const millions  = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;
  let r = '';
  if (millions)  r += below1000(millions)  + ' Million';
  if (thousands) r += (r ? ', ' : '') + below1000(thousands) + ' Thousand';
  if (remainder) r += (r ? ', ' : '') + below1000(remainder);
  return r;
}

// ── Shared PDF CSS ────────────────────────────────────────────────────────────
const PDF_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 40px 48px; }
  .hdr { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #0d2b6b; padding-bottom: 14px; margin-bottom: 24px; }
  .hdr img { width: 60px; height: 60px; flex-shrink: 0; }
  .hdr-text h1 { font-size: 17px; font-weight: 800; color: #0d2b6b; letter-spacing: 0.02em; }
  .hdr-text p  { font-size: 11px; color: #555; margin-top: 3px; line-height: 1.6; }
  .doc-title { text-align: center; margin: 20px 0 24px; }
  .doc-title h2 { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #0d2b6b; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 24px; font-size: 12px; }
  .meta dt { color: #666; }
  .meta dd { font-weight: 600; }
  .box { border: 1.5px solid #0d2b6b; border-radius: 6px; margin-bottom: 20px; overflow: hidden; }
  .box-hd { background: #0d2b6b; color: #fff; padding: 8px 14px; font-weight: 700; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
  .box table { width: 100%; border-collapse: collapse; }
  .box td, .box th { padding: 9px 14px; font-size: 12px; border-bottom: 1px solid #e8e8e8; }
  .box th { background: #f4f6fb; font-weight: 700; }
  .box tr:last-child td { border-bottom: none; }
  .box .amt { font-size: 22px; font-weight: 900; color: #0d2b6b; padding: 14px; text-align: right; }
  .sum-stmt { font-size: 12px; color: #111; margin-bottom: 24px; line-height: 1.7; padding: 12px 14px; background: #f4f6fb; border-left: 4px solid #0d2b6b; border-radius: 0 4px 4px 0; }
  .sigs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 40px; }
  .sig { border-top: 1.5px solid #111; padding-top: 8px; }
  .sig p { font-size: 11px; font-weight: 700; }
  .sig small { font-size: 10px; color: #666; }
  .r { text-align: right; }
  @media print {
    body { padding: 20px 28px; }
    @page { margin: 1cm; size: A4; }
  }
`;

// ── Build one advice page body (shared by single and print-all) ───────────────
function buildAdvicePage(advice, batch) {
  const period     = periodLabel(batch.period);
  const refNo      = `KADCHMA/CAP/${batch.id}/${advice.code}`;
  const today      = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const gross      = advice.amount;
  const deduction  = Math.round(gross * 0.005);
  const net        = gross - deduction;
  const netWords   = toWords(net);

  return `
<div class="hdr">
  <img src="${window.location.origin}/kadchma_logo.png" alt="KADCHMA Logo" />
  <div class="hdr-text">
    <h1>KADUNA STATE CONTRIBUTORY HEALTH MANAGEMENT AUTHORITY</h1>
    <p>18 Independence Way, Sabon Gari, Kaduna 800283, Kaduna<br>Tel: 0800 000 0000 &nbsp;|&nbsp; kadchma.gov.ng</p>
  </div>
</div>

<div class="doc-title">
  <h2>Capitation Payment Advice</h2>
</div>

<dl class="meta">
  <dt>Reference No.</dt>   <dd>${refNo}</dd>
  <dt>Date Issued</dt>     <dd>${today}</dd>
  <dt>Batch ID</dt>        <dd>${batch.id}</dd>
  <dt>Payment Period</dt>  <dd>${period}</dd>
</dl>

<div class="box">
  <div class="box-hd">Facility Details</div>
  <table>
    <tr><td>Facility Name</td><td style="font-weight:700">${advice.facility}</td></tr>
    <tr><td>Facility Code</td><td>${advice.code}</td></tr>
    <tr><td>Bank Name</td><td>${advice.bank}</td></tr>
    <tr><td>Account Number</td><td style="font-family:monospace;letter-spacing:0.1em">${advice.acct}</td></tr>
  </table>
</div>

<div class="box">
  <div class="box-hd">Payment Computation</div>
  <table>
    <thead><tr><th>Description</th><th class="r">Quantity</th><th class="r">Rate (₦)</th><th class="r">Amount (₦)</th></tr></thead>
    <tbody>
      <tr>
        <td>Gross capitation — ${period}</td>
        <td class="r">${advice.enrollees.toLocaleString()} enrollees</td>
        <td class="r">${RATE.toLocaleString()}.00</td>
        <td class="r">${gross.toLocaleString()}.00</td>
      </tr>
      <tr>
        <td>Less: 0.5% withholding deduction</td>
        <td class="r" colspan="2"></td>
        <td class="r" style="color:#c00">(${deduction.toLocaleString()}.00)</td>
      </tr>
      <tr style="font-weight:700;background:#f4f6fb">
        <td colspan="3">Net Payable</td>
        <td class="r">${net.toLocaleString()}.00</td>
      </tr>
    </tbody>
  </table>
  <div class="amt">Net Payable: ${naira(net)}</div>
</div>

<div class="sum-stmt">
  The sum of <strong>${naira(net)}</strong> (<em>${netWords} Naira</em>) only, being capitation payment to
  <strong>${advice.facility}</strong> for the month of <strong>${period}</strong>.
</div>

<div class="sigs">
  <div class="sig"><p>Prepared by (Accounts)</p><small>Name &amp; Signature / Date</small></div>
  <div class="sig"><p>Reviewed by (DAF)</p><small>Name &amp; Signature / Date</small></div>
  <div class="sig"><p>Approved by (DG)</p><small>Name &amp; Signature / Date</small></div>
</div>`;
}

// ── PDF print helper ────────────────────────────────────────────────────────
function buildAdviceHTML(advice, batch) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Payment Advice – ${advice.facility}</title>
<style>${PDF_CSS}</style>
</head>
<body>
${buildAdvicePage(advice, batch)}
</body>
</html>`;
}

function printAdvice(advice, batch) {
  const html = buildAdviceHTML(advice, batch);
  const win = window.open('', '_blank', 'width=850,height=1100');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

function printAll(batch) {
  const period = periodLabel(batch.period);
  const bodyPages = batch.advices.map((advice, i) => {
    const isLast = i === batch.advices.length - 1;
    return `<div style="${isLast ? '' : 'page-break-after:always'}">${buildAdvicePage(advice, batch)}</div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Payment Advices — ${period}</title>
<style>${PDF_CSS}</style>
</head>
<body>
${bodyPages}
</body>
</html>`;

  const win = window.open('', '_blank', 'width=850,height=1100');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

// ── Generate Batch Dialog ────────────────────────────────────────────────────
const CAP_MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const CAP_MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function GenerateBatchDialog({ data, dispatch, onClose }) {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(CAP_MONTHS[now.getMonth()]);

  const template = data.capitation[0]?.advices ?? [];

  const submit = () => {
    const period = year + '-' + month;
    if (data.capitation.find(b => b.period === period)) {
      dispatch({ type: 'SHOW_TOAST', payload: 'A batch for this period already exists' });
      return;
    }
    const advices = template.map(a => {
      const enrollees = Math.round(a.amount / RATE);
      return { ...a, enrollees, amount: enrollees * RATE };
    });
    const newBatch = {
      id: 'CAP-' + period, period, stage: 0,
      trail: [{ role: 'Accounts', at: new Date().toISOString(), note: 'Batch generated from enrolment register' }],
      advices,
    };
    dispatch({ type: 'UPDATE_DATA', key: 'capitation', payload: [newBatch, ...data.capitation] });
    dispatch({ type: 'SHOW_TOAST', payload: `Batch CAP-${period} generated` });
    onClose();
  };

  const F = ({ label, children }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ font: '600 12px var(--sans)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      {children}
    </label>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', padding: 'var(--s6)', width: 'min(420px,95vw)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
          <h2 style={{ fontSize: 18 }}>Generate capitation batch</h2>
          <button className="iconbtn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3) var(--s4)', marginBottom: 'var(--s4)' }}>
          <F label="Month">
            <select value={month} onChange={e => setMonth(e.target.value)}>
              {CAP_MONTHS.map((m, i) => <option key={m} value={m}>{CAP_MONTH_LABELS[i]}</option>)}
            </select>
          </F>
          <F label="Year">
            <select value={year} onChange={e => setYear(e.target.value)}>
              {['2024','2025','2026','2027','2028','2029','2030'].map(y => <option key={y}>{y}</option>)}
            </select>
          </F>
        </div>
        <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', padding: 'var(--s3) var(--s4)', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 'var(--s5)' }}>
          {template.length} facilities · ₦{RATE.toLocaleString()} per enrollee
        </div>
        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn pri" onClick={submit}><Icon name="plus" size={16} /> Generate</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function Capitation() {
  const { me, sel } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const role = user?.role ?? '';
  const [showGenerate, setShowGenerate] = useState(false);
  const selected = sel ? data.capitation.find(c => c.id === sel) : null;

  if (selected) {
    return <BatchDetail batch={selected} role={role} data={data} dispatch={dispatch} />;
  }

  const canCreate = ['Accounts', 'Administrator'].includes(role);

  return (
    <>
      {showGenerate && <GenerateBatchDialog data={data} dispatch={dispatch} onClose={() => setShowGenerate(false)} />}
      <div className="phead">
        <div>
          <span className="overline">Finance</span>
          <h1>Capitation</h1>
        </div>
        {canCreate && (
          <button className="btn pri" onClick={() => setShowGenerate(true)}>
            <Icon name="plus" size={16} /> Generate batch
          </button>
        )}
      </div>

      <div className="card flush">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Period</th>
                <th className="r">Facilities</th>
                <th className="r">Enrollees</th>
                <th className="r">Total (₦)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.capitation.map(c => {
                const total = c.advices.reduce((a, x) => a + x.amount, 0);
                const enrollees = c.advices.reduce((a, x) => a + x.enrollees, 0);
                return (
                  <tr key={c.id} className="click" onClick={() => dispatch({ type: 'SET_SEL', payload: c.id })}>
                    <td className="num" style={{ fontWeight: 700 }}>{c.id}</td>
                    <td>{periodLabel(c.period)}</td>
                    <td className="r num">{c.advices.length}</td>
                    <td className="r num">{enrollees.toLocaleString()}</td>
                    <td className="r num">{naira(total)}</td>
                    <td><Pill status={STAGES[c.stage] ?? 'Approved'} /></td>
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

// ── Batch detail ────────────────────────────────────────────────────────────
function BatchDetail({ batch, role, data, dispatch }) {
  const totalGross    = batch.advices.reduce((a, x) => a + x.amount, 0);
  const totalDeduct   = Math.round(totalGross * 0.005);
  const totalAmount   = totalGross - totalDeduct;
  const totalEnrollee = batch.advices.reduce((a, x) => a + x.enrollees, 0);
  const status     = STAGES[batch.stage] ?? 'Approved';
  const currentRole = STAGE_ROLES[batch.stage];
  const canAct     = currentRole === role && batch.stage < 4;
  const approved   = batch.stage >= 4;

  const advance = () => {
    const updated = data.capitation.map(c =>
      c.id === batch.id
        ? { ...c, stage: c.stage + 1, trail: [...c.trail, { role, at: new Date().toISOString(), note: '' }] }
        : c
    );
    dispatch({ type: 'UPDATE_DATA', key: 'capitation', payload: updated });
    dispatch({ type: 'SHOW_TOAST', payload: 'Batch forwarded' });
  };

  const period = periodLabel(batch.period);
  const curStep = Math.min(batch.stage, FLOW.length - 1);

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Capitation
            </button>
          </div>
          <h1 style={{ fontSize: 22, marginTop: 4 }}>Capitation — {period}</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          <button className="btn sec" onClick={() => printAll(batch)}>
            <Icon name="print" size={16} /> Print all advices
          </button>
          <Pill status={status} />
        </div>
      </div>

      {/* Progress stepper */}
      <div className="card" style={{ padding: 'var(--s4) var(--s6)', marginBottom: 'var(--s4)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 420 }}>
          {FLOW.map((step, i) => {
            const done = curStep > i;
            const current = curStep === i;
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
                    {step}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? 'var(--brand)' : 'var(--border)', margin: '0 4px', marginBottom: 18 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', marginBottom: 'var(--s4)' }}>
        {[
          { label: 'Facilities', value: batch.advices.length },
          { label: 'Total enrollees', value: totalEnrollee.toLocaleString() },
          { label: 'Net payable (after 0.5%)', value: naira(totalAmount) },
        ].map(({ label, value }) => (
          <div key={label} className="card kpi" style={{ padding: 'var(--s4)' }}>
            <div className="small muted" style={{ marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Facilities table */}
      <div className="card flush" style={{ marginBottom: 'var(--s4)' }}>
        <div className="chead">
          <h3>Payment advices — {period}</h3>
          <span className="small muted">Rate: {naira(RATE)} per enrollee</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Facility</th>
                <th>Code</th>
                <th>Bank</th>
                <th>Account</th>
                <th className="r">Enrollees</th>
                <th className="r">Gross (₦)</th>
                <th className="r">0.5% Deduction</th>
                <th className="r">Net Payable (₦)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batch.advices.map((a, i) => {
                const gross = a.amount;
                const deduct = Math.round(gross * 0.005);
                const net = gross - deduct;
                return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{a.facility}</td>
                  <td className="small muted" style={{ fontFamily: 'monospace' }}>{a.code}</td>
                  <td>{a.bank}</td>
                  <td style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{a.acct}</td>
                  <td className="r num">{a.enrollees.toLocaleString()}</td>
                  <td className="r num">{naira(gross)}</td>
                  <td className="r num" style={{ color: 'var(--danger)' }}>({naira(deduct)})</td>
                  <td className="r num" style={{ fontWeight: 600 }}>{naira(net)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn ghost"
                      style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
                      onClick={() => printAdvice(a, batch)}
                    >
                      <Icon name="print" size={13} /> Print
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td colSpan={4}>Total — {batch.advices.length} facilities</td>
                <td className="r num">{totalEnrollee.toLocaleString()}</td>
                <td className="r num">{naira(totalGross)}</td>
                <td className="r num" style={{ color: 'var(--danger)' }}>({naira(totalDeduct)})</td>
                <td className="r num">{naira(totalAmount)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
        {/* Action panel */}
        {canAct && (
          <div className="card">
            <h3>Your action</h3>
            <p className="small muted" style={{ marginBottom: 'var(--s3)' }}>
              Batch is pending your review as <strong>{currentRole}</strong>.
            </p>
            <button className="btn pri" onClick={advance}>
              <Icon name="check" size={16} />
              {batch.stage === 3 ? 'Approve &amp; authorise payment' : 'Forward to next stage'}
            </button>
          </div>
        )}

        {/* Approval trail */}
        <div className="card" style={{ gridColumn: canAct ? 'auto' : '1 / -1' }}>
          <h3>Approval trail</h3>
          <ul className="log">
            {batch.trail.map((t, i) => (
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

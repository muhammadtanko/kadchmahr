import { DEPTS } from '../../data/mockData';
import Icon from '../ui/Icon';

/* ─── formatting ──────────────────────────────────────────── */
const fmt = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const naira = n => fmt.format(n);
function nairaShort(n) {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return '₦' + (n / 1_000).toFixed(1) + 'K';
  return naira(n);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return fmtDate(iso);
}

/* ─── request helpers — work with both stage (mock) and status (backend) ── */
const REQ_STAGES = ['owner', 'Department Head', 'DG', 'Admin', 'Accounts', 'Pre-audit', 'Post-audit', 'Payment'];
function reqStageName(r) {
  if (r.stage != null) return REQ_STAGES[r.stage] ?? 'Complete';
  return r.status ?? '';
}
const REJECTED_STATUSES = new Set([
  'Rejected by HoD','Rejected by DG','Rejected by Accounts','Rejected by Admin',
  'Rejected by Auditor For Pre-Audit','Rejected by Auditor For Post-Audit',
]);
function isComplete(r) {
  if (r.stage != null) return !r.rejected && r.stage >= 8;
  return r.status === 'Payment Completed';
}
function isPending(r) {
  if (r.stage != null) return !r.rejected && r.stage > 0 && r.stage < 8;
  return !REJECTED_STATUSES.has(r.status) && r.status !== 'Payment Completed' && r.status !== 'Submitted';
}
function isRejected(r) {
  if (r.rejected != null) return r.rejected;
  return REJECTED_STATUSES.has(r.status);
}

/* ─── payroll helpers ────────────────────────────────────── */
const PAYROLL_STAGES = { 0: 'Draft', 1: 'Submitted', 2: 'DAF Review', 3: 'Released' };
function payrollStageName(stage) { return PAYROLL_STAGES[stage] ?? `Stage ${stage}`; }
function payrollStageOk(stage)   { return stage >= 3; }

/* ─── activity stream ────────────────────────────────────── */
function buildActivity(data) {
  const events = [];

  data.requests.forEach(r => {
    (r.trail ?? []).slice(-1).forEach(t => {
      events.push({ at: t.at, icon: 'money', color: 'brand', text: `${r.id} — ${(r.head || '').slice(0, 48)}`, sub: t.role !== 'owner' ? `${t.role} actioned` : 'Submitted' });
    });
    (r.comments ?? []).forEach(c => {
      const who = data.staff.find(s => s.id === c.by);
      if (who) events.push({ at: c.at, icon: 'comment', color: 'muted', text: `Comment on ${r.id}`, sub: who.name });
    });
  });

  data.memos.forEach(m => {
    const byName = m.createdBy?.name ?? '';
    events.push({ at: m.at, icon: 'mail', color: 'brand', text: m.subject, sub: m.type === 'External' ? (m.org || byName) : (byName ? `By ${byName}` : 'Internal') });
  });

  data.activities.forEach(a => {
    (a.trail ?? []).slice(-1).forEach(t => {
      events.push({ at: t.at, icon: 'event', color: 'brand', text: a.title, sub: `${t.role} actioned` });
    });
  });

  data.payroll.forEach(p => {
    const t = (p.trail ?? [])[p.trail.length - 1];
    if (t) events.push({ at: t.at, icon: 'doc', color: 'gold', text: `Payroll ${p.period}`, sub: t.note || t.role });
  });

  (data.tickets ?? []).forEach(tk => {
    events.push({ at: tk.at, icon: 'wrench', color: 'muted', text: `${tk.id} — ${tk.title}`, sub: tk.status });
  });

  return events.filter(e => e.at && typeof e.at === 'string').sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
}

/* ─── DashboardView — pure render, no hooks ──────────────── */
export default function DashboardView({ data }) {
  const activeStaff = data.staff.filter(s => s.status === 'Active');
  const deptCount   = new Set(activeStaff.map(s => s.dept)).size;
  const pending     = data.requests.filter(isPending);
  const completed   = data.requests.filter(isComplete);
  const rejected    = data.requests.filter(isRejected);
  const pendingLeave= data.leave.filter(l => ['Pending', 'Submitted'].includes(l.status));

  const totalRequestValue = data.requests.reduce((a, r) => a + (r.amount || 0), 0);
  const pendingValue      = pending.reduce((a, r) => a + (r.amount || 0), 0);
  const completedValue    = completed.reduce((a, r) => a + (r.amount || 0), 0);

  const sortedPayroll      = [...data.payroll].sort((a, b) => b.period.localeCompare(a.period));
  const latestPayroll      = sortedPayroll[0];
  const latestPayrollTotal = latestPayroll?.lines.reduce((a, l) => a + l.gross, 0) ?? 0;
  const prevPayroll        = sortedPayroll[1];
  const prevPayrollTotal   = prevPayroll?.lines.reduce((a, l) => a + l.gross, 0) ?? 0;

  const sortedCap      = [...(data.capitation ?? [])].sort((a, b) => b.period.localeCompare(a.period));
  const capLatest      = sortedCap[0];
  const capPrev        = sortedCap[1];
  const capLatestTotal = capLatest ? capLatest.advices.reduce((a, x) => a + x.enrollees * 500, 0) : 0;
  const capPrevTotal   = capPrev   ? capPrev.advices.reduce((a, x) => a + x.enrollees * 500, 0) : 0;

  const byDept = DEPTS.map(d => ({
    dept: d,
    staff: data.staff.filter(s => s.dept === d).length,
    requests: data.requests.filter(r => data.staff.find(s => s.id === r.owner)?.dept === d).length,
    leave: data.leave.filter(l => data.staff.find(s => s.id === l.who)?.dept === d).length,
  })).filter(d => d.staff > 0);
  const maxStaff = Math.max(...byDept.map(d => d.staff), 1);

  const leaveTypes  = ['Annual Leave', 'Annual leave', 'Casual Leave', 'Casual leave', 'Sick Leave', 'Sick leave'];
  const uniqueTypes = ['Annual Leave', 'Casual Leave', 'Sick Leave'];
  const leaveCounts = uniqueTypes.map(t => {
    const norm = t.toLowerCase();
    const matching = data.leave.filter(l => l.type?.toLowerCase() === norm);
    const pendingCount = matching.filter(l => ['Pending', 'Submitted'].includes(l.status)).length;
    return { type: t, count: matching.length, pending: pendingCount };
  });

  const openTickets   = (data.tickets ?? []).filter(t => t.status === 'Open').length;
  const inProgressTix = (data.tickets ?? []).filter(t => t.status === 'In Progress').length;
  const resolvedTix   = (data.tickets ?? []).filter(t => t.status === 'Resolved').length;

  const assetGood    = (data.assets ?? []).filter(a => a.cond === 'Good').length;
  const assetFair    = (data.assets ?? []).filter(a => a.cond === 'Fair').length;
  const assetDamaged = (data.assets ?? []).filter(a => a.cond === 'Damaged').length;
  const totalAssets  = (data.assets ?? []).length;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = [...data.meetings]
    .filter(m => m.date && new Date(m.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const activity = buildActivity(data);
  const accounts = data.accounts ?? [];
  const totalBal = accounts.reduce((a, ac) => a + (ac.bal || 0), 0);

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Overview</span>
          <h1>Dashboard</h1>
        </div>
        <span className="small muted">Last updated: {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      {/* ── Row 1: KPI strip ── */}
      <div className="grid g4">
        <KpiCard label="Active staff"           value={activeStaff.length}  sub={`${deptCount} departments`} icon="group" />
        <KpiCard label="Requests in progress"   value={pending.length}       sub={nairaShort(pendingValue) + ' pending'} icon="money" accent />
        <KpiCard label="Leave applications"     value={data.leave.length}    sub={`${pendingLeave.length} pending approval`} icon="clock" />
        <KpiCard label="Funds under management" value={nairaShort(totalBal)} sub={`across ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`} icon="dash" gold />
      </div>

      {/* ── Row 2: Requests pipeline + Accounts + Payroll ── */}
      <div className="grid g3">
        <div className="card">
          <div className="chead">
            <h3>Financial requests</h3>
            <span className="tag">{data.requests.length} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            <PipelineRow label="In progress" count={pending.length}   total={data.requests.length} color="var(--gold-400)" />
            <PipelineRow label="Completed"   count={completed.length} total={data.requests.length} color="var(--success)"  />
            <PipelineRow label="Rejected"    count={rejected.length}  total={data.requests.length} color="var(--danger)"   />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            <ValRow label="Total requested" val={nairaShort(totalRequestValue)} />
            <ValRow label="Pending value"   val={nairaShort(pendingValue)} muted />
            <ValRow label="Paid out"        val={nairaShort(completedValue)} />
          </div>
          <div>
            <span className="overline" style={{ display: 'block', marginBottom: 'var(--s2)' }}>By stage</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pending.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 'var(--s3)' }}>
                  <span style={{ color: 'var(--ink-muted)', minWidth: 90 }}>{r.id}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.head}</span>
                  <span className="tag" style={{ flexShrink: 0 }}>{reqStageName(r)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Account balances</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
            {accounts.map(acc => {
              const pct = totalBal > 0 ? Math.round((acc.bal / totalBal) * 100) : 0;
              return (
                <div key={acc.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{nairaShort(acc.bal)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: 'var(--brand)', width: pct + '%' }} />
                  </div>
                  {(acc.subs ?? []).map(([label, amount]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-muted)', paddingLeft: 8, paddingBlock: 2 }}>
                      <span>{label}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{nairaShort(amount)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)' }}>
            <ValRow label="Total" val={nairaShort(totalBal)} />
          </div>
        </div>

        <div className="card">
          <h3>Payroll</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {[latestPayroll, prevPayroll].filter(Boolean).map((p, i) => {
              const tot = p.lines.reduce((a, l) => a + l.gross, 0);
              return (
                <div key={p.id} style={{ padding: 'var(--s3)', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>PAY-{p.period}</span>
                    <span className={`pill ${payrollStageOk(p.stage) ? 'ok' : 'warn'}`}>{payrollStageName(p.stage)}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{nairaShort(tot)}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{p.lines.length} staff · {i === 0 ? 'current run' : 'previous run'}</div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            {latestPayroll && <ValRow label={latestPayroll.period} val={nairaShort(latestPayrollTotal)} muted />}
            {prevPayroll   && <ValRow label={prevPayroll.period}   val={nairaShort(prevPayrollTotal)} />}
          </div>
        </div>
      </div>

      {/* ── Row 3: Staff + Leave + Capitation ── */}
      <div className="grid g3">
        <div className="card">
          <div className="chead">
            <h3>Staff by department</h3>
            <span className="tag">{activeStaff.length} active</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            {byDept.sort((a, b) => b.staff - a.staff).map(row => (
              <div key={row.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{row.dept}</span>
                  <span style={{ fontWeight: 700 }}>{row.staff}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--border)' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'var(--brand)', width: Math.round((row.staff / maxStaff) * 100) + '%' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            <ValRow label="Permanent" val={data.staff.filter(s => s.appt === 'Permanent').length + ' staff'} />
            <ValRow label="Adhoc"     val={data.staff.filter(s => s.appt === 'Adhoc').length + ' staff'} muted />
          </div>
        </div>

        <div className="card">
          <h3>Leave</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            {leaveCounts.map(lc => (
              <div key={lc.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s3)', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{lc.type}</div>
                  {lc.pending > 0 && <div style={{ fontSize: 12, color: 'var(--accent)' }}>{lc.pending} pending</div>}
                </div>
                <span style={{ fontWeight: 800, fontSize: 22 }}>{lc.count}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            <ValRow label="Total applications" val={data.leave.length} />
            <ValRow label="Approved" val={data.leave.filter(l => l.status?.includes('Approved')).length} />
            <ValRow label="Pending"  val={pendingLeave.length} muted />
          </div>
        </div>

        <div className="card">
          <h3>Capitation</h3>
          {(data.capitation ?? []).length === 0 && <p className="muted small">No capitation data.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {[capLatest, capPrev].filter(Boolean).map(batch => {
              const tot = batch.advices.reduce((a, x) => a + x.enrollees * 500, 0);
              const enrollees = batch.advices.reduce((a, x) => a + x.enrollees, 0);
              const CAP_STAGES = ['Generated', 'DAF Review', 'DG Approved', 'Paid'];
              const stageName = CAP_STAGES[batch.stage - 1] ?? `Stage ${batch.stage}`;
              return (
                <div key={batch.id} style={{ padding: 'var(--s3)', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{batch.period}</span>
                    <span className={`pill ${batch.stage >= 3 ? 'ok' : 'warn'}`}>{stageName}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{nairaShort(tot)}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{batch.advices.length} facilities · {enrollees.toLocaleString()} enrollees</div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            {capLatest && <ValRow label={capLatest.period} val={nairaShort(capLatestTotal)} muted />}
            {capPrev   && <ValRow label={capPrev.period}   val={nairaShort(capPrevTotal)} />}
            <ValRow label="Rate / enrollee" val="₦500" />
          </div>
        </div>
      </div>

      {/* ── Row 4: Activity + Meetings + Tickets + Assets ── */}
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 'var(--s6)', alignItems: 'start' }}>
        <div className="card flush">
          <div className="chead"><h3>Recent activity</h3></div>
          <ul className="log" style={{ padding: 'var(--s4) var(--s6)', gap: 'var(--s4)' }}>
            {activity.length === 0 && <li style={{ color: 'var(--ink-muted)', fontSize: 13 }}>No recent activity.</li>}
            {activity.map((ev, i) => (
              <li key={i} style={{ gap: 'var(--s3)', alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-full)', background: ev.color === 'gold' ? 'var(--highlight)' : ev.color === 'muted' ? 'var(--surface-sunken)' : 'var(--brand-subtle)', color: ev.color === 'gold' ? 'var(--on-highlight)' : ev.color === 'muted' ? 'var(--ink-muted)' : 'var(--on-brand-subtle)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={ev.icon} size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.text}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'flex', gap: 'var(--s3)' }}>
                    <span>{ev.sub}</span><span>·</span><span>{timeAgo(ev.at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="stack">
          <div className="card flush">
            <div className="chead"><h3>Upcoming meetings</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcoming.length === 0 && <div className="empty small">No upcoming meetings</div>}
              {upcoming.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: 'var(--s3)', padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <div style={{ background: 'var(--brand)', color: 'var(--on-brand)', borderRadius: 'var(--r-sm)', padding: '4px 8px', textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {new Date(m.date).toLocaleDateString('en-NG', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{new Date(m.date).getDate()}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{m.time} · {m.venue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="chead">
              <h3>Service requests</h3>
              <span className="tag">{(data.tickets ?? []).length} total</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
              <StatusRow label="Open"        count={openTickets}   color="var(--accent)" />
              <StatusRow label="In progress" count={inProgressTix} color="var(--warning)" />
              <StatusRow label="Resolved"    count={resolvedTix}   color="var(--success)" />
              <StatusRow label="Closed"      count={(data.tickets ?? []).filter(t => t.status === 'Closed').length} color="var(--ink-muted)" />
            </div>
          </div>

          <div className="card">
            <div className="chead">
              <h3>Assets</h3>
              <span className="tag">{totalAssets} items</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
              <StatusRow label="Good"    count={assetGood}    color="var(--success)" />
              <StatusRow label="Fair"    count={assetFair}    color="var(--warning)" />
              <StatusRow label="Damaged" count={assetDamaged} color="var(--danger)"  />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s3)' }}>
              <ValRow label="Assigned" val={(data.assets ?? []).filter(a => a.to).length + ' items'} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── sub-components ─────────────────────────────────────── */
function KpiCard({ label, value, sub, icon, accent, gold }) {
  return (
    <div className="card kpi" style={{ gap: 'var(--s2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="overline">{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--r-full)', background: gold ? 'var(--highlight)' : 'var(--brand-subtle)', color: gold ? 'var(--on-highlight)' : 'var(--on-brand-subtle)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={15} />
        </div>
      </div>
      <span className={`v num ${accent ? 'accent' : ''}`} style={gold ? { color: 'var(--gold-400)' } : {}}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{sub}</span>}
    </div>
  );
}
function PipelineRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
      <span style={{ fontSize: 12, minWidth: 80, color: 'var(--ink-muted)' }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)' }}>
        <div style={{ height: '100%', borderRadius: 4, background: color, width: pct + '%', minWidth: count > 0 ? 4 : 0 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'right' }}>{count}</span>
    </div>
  );
}
function ValRow({ label, val, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: muted ? 'var(--ink-muted)' : 'inherit' }}>{val}</span>
    </div>
  );
}
function StatusRow({ label, count, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span>{label}</span>
      </div>
      <span style={{ fontWeight: 700 }}>{count}</span>
    </div>
  );
}

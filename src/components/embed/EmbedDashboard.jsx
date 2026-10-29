import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import { EmbedFrame } from './EmbedFrame';

const fmt = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const naira = n => fmt.format(n);
function nairaShort(n) {
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return '₦' + (n / 1_000).toFixed(1) + 'K';
  return naira(n);
}

const PAYROLL_STAGES = { 0: 'Draft', 1: 'Submitted', 2: 'DAF Review', 3: 'Released' };

async function fetchStats() {
  const res = await fetch(`${API_BASE_URL}/embed/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export default function EmbedDashboard() {
  const qc = useQueryClient();
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['embed-stats'],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  });

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['embed-stats'] });
  }, [qc]);

  return (
    <EmbedFrame onRefresh={refresh}>
      <header>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted, #666)', marginBottom: 4 }}>Overview</div>
        <h1 style={{ margin: 0, fontSize: 27, fontWeight: 700, color: 'var(--ink, #111)' }}>HR &amp; Finance Dashboard</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-muted, #666)', lineHeight: 1.5 }}>
          KADCHMA — live headcount, financial requests, payroll and leave at a glance.
        </p>
      </header>

      {isLoading && (
        <p style={{ fontSize: 13, color: 'var(--ink-muted, #888)', padding: '16px 0' }}>Loading dashboard…</p>
      )}

      {isError && (
        <p style={{ fontSize: 13, color: '#dc2626', padding: '16px', background: '#fef2f2', borderRadius: 6 }}>
          Dashboard figures are unavailable right now. Please try again shortly.
        </p>
      )}

      {stats && (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <KpiCard label="Active staff"          value={stats.staff.active}          sub={`${stats.staff.depts} departments`} />
            <KpiCard label="Requests in progress"  value={stats.requests.pending}       sub={`${nairaShort(stats.requests.pendingValue)} pending`} accent />
            <KpiCard label="Leave applications"    value={stats.leave.total}            sub={`${stats.leave.pending} pending approval`} />
            {stats.payroll && (
              <KpiCard label={`Payroll · ${stats.payroll.period}`} value={nairaShort(stats.payroll.total)} sub={`${stats.payroll.staffCount} staff · ${PAYROLL_STAGES[stats.payroll.stage] ?? 'Released'}`} gold />
            )}
          </div>

          {/* Requests + Staff breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
            {/* Financial requests */}
            <Card title="Financial requests" tag={`${stats.requests.total} total`}>
              <PipeRow label="In progress" count={stats.requests.pending}   total={stats.requests.total} color="#f59e0b" />
              <PipeRow label="Completed"   count={stats.requests.completed} total={stats.requests.total} color="#10b981" />
              <PipeRow label="Rejected"    count={stats.requests.rejected}  total={stats.requests.total} color="#ef4444" />
              <Divider />
              <ValRow label="Total value"    val={nairaShort(stats.requests.pendingValue + stats.requests.completedValue)} />
              <ValRow label="Pending value"  val={nairaShort(stats.requests.pendingValue)} muted />
              <ValRow label="Paid out"       val={nairaShort(stats.requests.completedValue)} />
            </Card>

            {/* Staff by department */}
            <Card title="Staff by department" tag={`${stats.staff.active} active`}>
              {stats.staff.byDept.slice(0, 8).map(row => {
                const max = stats.staff.byDept[0]?.count || 1;
                return (
                  <div key={row.dept} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                      <span>{row.dept}</span>
                      <span style={{ fontWeight: 700 }}>{row.count}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#e5e7eb' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: '#2563eb', width: Math.round((row.count / max) * 100) + '%' }} />
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Upcoming meetings */}
            <Card title="Upcoming meetings" tag={`${stats.meetings.total} total`}>
              {stats.meetings.upcoming.length === 0 && (
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No upcoming meetings.</p>
              )}
              {stats.meetings.upcoming.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                  <div style={{ background: '#2563eb', color: '#fff', borderRadius: 6, padding: '4px 8px', textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {new Date(m.date).toLocaleDateString('en-NG', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
                      {new Date(m.date).getDate()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.time} · {m.venue}</div>
                  </div>
                </div>
              ))}
              <Divider />
              <ValRow label="Memos"      val={stats.memos} />
              <ValRow label="Activities" val={stats.activities} muted />
            </Card>
          </div>
        </>
      )}
    </EmbedFrame>
  );
}

function KpiCard({ label, value, sub, accent, gold }) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #e5e7eb)',
      borderRadius: 8,
      padding: '16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: accent ? '#2563eb' : gold ? '#d97706' : 'var(--ink, #111)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Card({ title, tag, children }) {
  return (
    <div style={{ background: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
        {tag && <span style={{ fontSize: 12, background: '#f3f4f6', borderRadius: 9999, padding: '2px 8px', color: '#6b7280', fontWeight: 600 }}>{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function PipeRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 12, minWidth: 80, color: '#9ca3af' }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#e5e7eb' }}>
        <div style={{ height: '100%', borderRadius: 4, background: color, width: pct + '%', minWidth: count > 0 ? 4 : 0 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

function ValRow({ label, val, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: muted ? '#9ca3af' : 'inherit' }}>{val}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />;
}

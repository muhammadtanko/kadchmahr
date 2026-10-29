import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import { EmbedFrame } from './EmbedFrame';
import DashboardView from '../pages/DashboardView';
import { ASSETS, CAPITATION, ACCOUNTS, TICKETS } from '../../data/mockData';

async function fetchAll() {
  const res = await fetch(`${API_BASE_URL}/embed/all`);
  if (!res.ok) throw new Error('Failed to load dashboard data');
  return res.json();
}

export default function EmbedDashboard() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['embed-all'],
    queryFn: fetchAll,
    staleTime: 60 * 1000,
  });

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['embed-all'] });
  }, [qc]);

  // Merge real backend data with static mock data for fields not in the backend
  const mergedData = data ? {
    staff:      data.staff      ?? [],
    leave:      data.leave      ?? [],
    requests:   data.requests   ?? [],
    payroll:    data.payroll    ?? [],
    memos:      data.memos      ?? [],
    meetings:   data.meetings   ?? [],
    activities: data.activities ?? [],
    files:      [],
    folders:    [],
    notifs:     [],
    // Static mock data
    accounts:   ACCOUNTS,
    assets:     ASSETS,
    capitation: CAPITATION,
    tickets:    TICKETS,
    convos:     [],
  } : null;

  return (
    <EmbedFrame onRefresh={refresh}>
      {isLoading && (
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', padding: '16px 0' }}>Loading dashboard…</p>
      )}
      {isError && (
        <p style={{ fontSize: 13, color: 'var(--danger, #dc2626)', padding: 16, background: 'var(--surface-sunken)', borderRadius: 8 }}>
          Dashboard data is unavailable right now. Please try again shortly.
        </p>
      )}
      {mergedData && <DashboardView data={mergedData} />}
    </EmbedFrame>
  );
}

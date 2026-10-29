import { useQuery } from '@tanstack/react-query';
import {
  api,
  mapUser, mapLeave, mapRequest, mapActivity, mapPayroll,
  mapMemo, mapMeeting, mapDocument, mapFolder, mapNotif,
} from '../api';
import { FOLDERS } from '../data/mockData';

function hasToken() {
  try { return !!localStorage.getItem('kadchma_token'); } catch { return false; }
}

export const KEYS = {
  staff:     ['staff'],
  leave:     ['leave'],
  requests:  ['requests'],
  activities:['activities'],
  payroll:   ['payroll'],
  memos:     ['memos'],
  meetings:  ['meetings'],
  documents: ['documents'],
  folders:   ['folders'],
  notifs:    (userId) => ['notifs', userId],
};

export function useStaffQuery() {
  return useQuery({
    queryKey: KEYS.staff,
    queryFn: async () => {
      const u = await api.get('/users');
      return Array.isArray(u) ? u.map(mapUser) : [];
    },
    enabled: hasToken(),
  });
}

export function useLeaveQuery() {
  return useQuery({
    queryKey: KEYS.leave,
    queryFn: async () => {
      const p = await api.get('/leave');
      return Array.isArray(p) ? p.map(mapLeave) : [];
    },
    enabled: hasToken(),
  });
}

export function useRequestsQuery() {
  return useQuery({
    queryKey: KEYS.requests,
    queryFn: async () => {
      const p = await api.get('/requests');
      const raw = Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : [];
      return raw.map(mapRequest);
    },
    enabled: hasToken(),
  });
}

export function useActivitiesQuery() {
  return useQuery({
    queryKey: KEYS.activities,
    queryFn: async () => {
      const p = await api.get('/activities');
      const raw = Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : [];
      return raw.map(mapActivity);
    },
    enabled: hasToken(),
  });
}

export function usePayrollQuery() {
  return useQuery({
    queryKey: KEYS.payroll,
    queryFn: async () => {
      const p = await api.get('/payroll');
      return Array.isArray(p) ? p.map(mapPayroll) : [];
    },
    enabled: hasToken(),
  });
}

export function useMemosQuery() {
  return useQuery({
    queryKey: KEYS.memos,
    queryFn: async () => {
      const p = await api.get('/memos');
      return Array.isArray(p) ? p.map(mapMemo) : [];
    },
    enabled: hasToken(),
  });
}

export function useMeetingsQuery() {
  return useQuery({
    queryKey: KEYS.meetings,
    queryFn: async () => {
      const p = await api.get('/meetings');
      return Array.isArray(p) ? p.map(mapMeeting) : [];
    },
    enabled: hasToken(),
  });
}

export function useDocumentsQuery() {
  return useQuery({
    queryKey: KEYS.documents,
    queryFn: async () => {
      const p = await api.get('/documents');
      return Array.isArray(p) ? p.map(mapDocument) : [];
    },
    enabled: hasToken(),
  });
}

export function useFoldersQuery() {
  return useQuery({
    queryKey: KEYS.folders,
    queryFn: async () => {
      const p = await api.get('/folders');
      const raw = Array.isArray(p) ? p : [];
      return [...FOLDERS, ...raw.map(mapFolder)];
    },
    enabled: hasToken(),
  });
}

export function useNotifsQuery(userId) {
  return useQuery({
    queryKey: KEYS.notifs(userId),
    queryFn: async () => {
      const p = await api.get(`/notifications/user/${userId}`);
      return Array.isArray(p) ? p.map(mapNotif) : [];
    },
    enabled: hasToken() && !!userId,
    staleTime: 30 * 1000,
  });
}

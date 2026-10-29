import { useApp } from '../context/AppContext';
import { ACCOUNTS } from '../data/mockData';
import {
  useStaffQuery, useLeaveQuery, useRequestsQuery, useActivitiesQuery,
  usePayrollQuery, useMemosQuery, useMeetingsQuery, useDocumentsQuery,
  useFoldersQuery, useNotifsQuery,
} from './queries';

export function useData() {
  const { me, assets, capitation, convos, tickets } = useApp();
  const { data: staff = [] }     = useStaffQuery();
  const { data: leave = [] }     = useLeaveQuery();
  const { data: requests = [] }  = useRequestsQuery();
  const { data: activities = [] }= useActivitiesQuery();
  const { data: payroll = [] }   = usePayrollQuery();
  const { data: memos = [] }     = useMemosQuery();
  const { data: meetings = [] }  = useMeetingsQuery();
  const { data: files = [] }     = useDocumentsQuery();
  const { data: folders = [] }   = useFoldersQuery();
  const { data: notifs = [] }    = useNotifsQuery(me);

  return {
    staff,
    leave,
    requests,
    activities,
    payroll,
    memos,
    meetings,
    files,
    folders,
    notifs,
    capitation,
    convos,
    assets,
    accounts: ACCOUNTS,
    tickets,
  };
}

export function useCurrentUser() {
  const { me } = useApp();
  const { data: staff = [] } = useStaffQuery();
  return staff.find(s => s.id === me);
}

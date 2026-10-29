import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { clearToken } from '../../api';
import Icon from '../ui/Icon';

// Standalone nav items
const TOP_NAV = [
  { k: 'home',      l: 'Home',         i: 'home', r: 'all' },
  { k: 'dashboard', l: 'Dashboard',    i: 'dash', r: ['Administrator', 'Admin', 'DG', 'Auditor'] },
];

const BOTTOM_NAV = [
  { k: 'myinfo', l: 'My Information', i: 'person', r: 'all' },
];

// Grouped nav items
const GROUPS = [
  {
    k: 'finance',
    l: 'Finance',
    i: 'money',
    r: ['Administrator', 'Admin', 'DG', 'Accounts', 'Auditor', 'DAF', 'Department_Head', 'User'],
    items: [
      { k: 'requests',   l: 'Financial Requests', i: 'money', r: ['Administrator', 'Admin', 'DG', 'Accounts', 'Auditor', 'User', 'Department_Head', 'DAF'] },
      { k: 'audit',      l: 'Audit Tray',          i: 'clip',  r: ['Administrator', 'Admin', 'DG', 'Accounts', 'Auditor'] },
      { k: 'payroll',    l: 'Payroll',              i: 'doc',   r: 'all' },
      { k: 'capitation', l: 'Capitation',           i: 'hosp',  r: ['Administrator', 'Accounts', 'DAF', 'DG'] },
    ],
  },
  {
    k: 'hr',
    l: 'HR',
    i: 'group',
    r: 'all',
    items: [
      { k: 'staff', l: 'Staff',  i: 'group',  r: ['Administrator', 'Admin', 'DG'], extra: ({ des, dept }) => des === 'Department_Head' && dept === 'ICT' },
      { k: 'leave', l: 'Leave',  i: 'clock',  r: 'all' },
    ],
  },
  {
    k: 'workspace',
    l: 'Workspace',
    i: 'folder',
    r: 'all',
    items: [
      { k: 'activities', l: 'Activities',  i: 'event',  r: 'all' },
      { k: 'meetings',   l: 'Meetings',    i: 'clock',  r: 'all' },
      { k: 'calendar',   l: 'Calendar',    i: 'event',  r: 'all' },
      { k: 'memos',      l: 'Memos',       i: 'mail',   r: 'all' },
      { k: 'messaging',  l: 'Messaging',   i: 'chat',   r: 'all' },
      { k: 'dms',        l: 'Documents',   i: 'folder', r: 'all' },
    ],
  },
  {
    k: 'admin',
    l: 'Administration',
    i: 'wrench',
    r: ['Administrator', 'Admin', 'DG', 'Store', 'Maintenance'],
    items: [
      { k: 'service', l: 'Service Requests', i: 'wrench', r: 'all' },
      { k: 'assets',  l: 'Assets',           i: 'box',    r: ['Administrator', 'Admin', 'Store'] },
    ],
  },
];

const SUPER_ROLES = ['Administrator', 'Admin', 'DG'];

// Which group contains a given route key
function groupOf(routeKey) {
  for (const g of GROUPS) {
    if (g.items.some(i => i.k === routeKey)) return g.k;
  }
  return null;
}

// Convert sidebar key → URL path
function toPath(k) { return k === 'home' ? '/' : `/${k}`; }

// Convert URL path → sidebar key
function toKey(pathname) {
  if (pathname === '/') return 'home';
  return pathname.slice(1).split('/')[0];
}

export default function Sidebar({ open, onClose }) {
  const { me } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const user = data.staff.find(s => s.id === me);
  const role = user?.role ?? '';
  const isSuper = SUPER_ROLES.includes(role);

  const currentKey = toKey(location.pathname);

  // Auto-open the group that contains the active page
  const [expanded, setExpanded] = useState(() => {
    const g = groupOf(currentKey);
    return g ? new Set([g]) : new Set();
  });

  useEffect(() => {
    const g = groupOf(currentKey);
    if (g) setExpanded(prev => new Set([...prev, g]));
  }, [currentKey]);

  const msgUnread = data.convos.filter(
    c => c.members.includes(me) && c.msgs.length && c.msgs[c.msgs.length - 1].from !== me
  ).length;
  const queueCount = getQueueCount(data, me, role, isSuper);

  const myDept = user?.dept ?? '';
  const myDes  = user?.des  ?? '';
  const canSee = (n) => {
    const roleOk  = n.r === 'all' || isSuper || (Array.isArray(n.r) && n.r.includes(role));
    const extraOk = n.extra ? n.extra({ role, des: myDes, dept: myDept }) : false;
    return roleOk || extraOk;
  };

  const go = (k) => {
    navigate(toPath(k));
    onClose?.();
  };

  const toggle = (k) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const renderItem = (n) => {
    let cnt = '';
    if (n.k === 'messaging' && msgUnread) cnt = msgUnread;
    if (n.k === 'home' && queueCount) cnt = queueCount;
    const active = currentKey === n.k;
    return (
      <button
        key={n.k}
        type="button"
        className={`nav ${active ? 'on' : ''}`}
        onClick={() => go(n.k)}
        aria-current={active ? 'page' : undefined}
      >
        <Icon name={n.i} size={18} />
        {n.l}
        {cnt ? <span className="cnt">{cnt}</span> : null}
      </button>
    );
  };

  const renderGroup = (g) => {
    const visibleItems = g.items.filter(canSee);
    if (!g.items.some(canSee) && !canSee(g)) return null;
    if (visibleItems.length === 0) return null;

    const isOpen = expanded.has(g.k);
    const hasActive = visibleItems.some(i => i.k === currentKey);

    return (
      <div key={g.k} className="nav-group">
        <button
          type="button"
          className={`nav nav-group-hd ${hasActive ? 'on' : ''}`}
          onClick={() => toggle(g.k)}
          aria-expanded={isOpen}
        >
          <Icon name={g.i} size={18} />
          <span style={{ flex: 1 }}>{g.l}</span>
          <Icon
            name="arrow_right"
            size={14}
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              opacity: 0.6,
              flexShrink: 0,
            }}
          />
        </button>
        {isOpen && (
          <div className="nav-group-body">
            {visibleItems.map(renderItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className={`side ${open ? 'side-open' : ''}`}
      aria-label="Main navigation"
    >
      <span className="overline">Navigation</span>

      {/* Standalone top items */}
      {TOP_NAV.filter(canSee).map(renderItem)}

      {/* Grouped sections */}
      {GROUPS.map(renderGroup)}

      {/* Standalone bottom items */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM_NAV.filter(canSee).map(renderItem)}
        <button
          type="button"
          className="nav"
          onClick={() => {
            clearToken();
            dispatch({ type: 'SET_ME', payload: null });
            dispatch({ type: 'SET_LOGGED_IN', payload: false });
          }}
          style={{ color: 'var(--danger, #ef4444)', marginTop: 4 }}
        >
          <Icon name="logout" size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
}

function getQueueCount(data, me, role, isSuper) {
  let count = 0;
  data.requests.forEach(r => {
    if (canActOn('request', r, role, me, isSuper)) count++;
  });
  return count;
}

function canActOn(kind, item, role, me, isSuper) {
  if (isSuper) return false;
  const REQUEST_STAGES = ['owner', 'Department_Head', 'DAF', 'Accounts', 'Auditor', 'DG'];
  if (kind === 'request') {
    return REQUEST_STAGES[item.stage] === role;
  }
  return false;
}

export { GROUPS, TOP_NAV, BOTTOM_NAV };

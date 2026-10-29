import { useState, useEffect } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useCurrentUser } from '../../hooks/useData';
import { useNotifsQuery } from '../../hooks/queries';
import { clearToken } from '../../api';
import Icon from '../ui/Icon';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('kadchma-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function TopBar({ onMenuToggle }) {
  const { me, tray } = useApp();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const { data: notifs = [] } = useNotifsQuery(me);
  const unread = notifs.filter(n => n.to === me && !n.read).length;

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('kadchma-theme', theme); } catch {}
  }, [theme]);

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <header className="top" role="banner">
      <button
        className="iconbtn menu-toggle"
        aria-label="Open navigation"
        onClick={onMenuToggle}
      >
        <Icon name="menu" size={22} />
      </button>

      <div className="brandmark">
        <div className="seal">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="var(--on-brand)" fillOpacity="0.15"/>
            <text x="16" y="22" textAnchor="middle" fill="var(--on-brand)" fontSize="14" fontWeight="800" fontFamily="sans-serif">K</text>
          </svg>
        </div>
        <div>
          <h3 style={{ color: 'var(--on-brand)', fontSize: 15 }}>KADCHMA</h3>
          <div className="sub" style={{ color: 'var(--on-brand)', opacity: 0.9, fontSize: 12 }}>HR &amp; Finance</div>
        </div>
      </div>

      <div className="spacer" />

      <button
        className="iconbtn"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
      </button>

      <button
        className="iconbtn"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_TRAY' })}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>

      <div
        className="avatar"
        title={user?.name}
        aria-label={user?.name}
      >
        {initials}
      </div>

    </header>
  );
}

import { useNavigate } from 'react-router-dom';
import { useApp, useDispatch } from '../../context/AppContext';
import { useNotifsQuery, KEYS } from '../../hooks/queries';
import { queryClient } from '../../lib/queryClient';
import { api } from '../../api';
import Icon from '../ui/Icon';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotifTray() {
  const { me } = useApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: allNotifs = [] } = useNotifsQuery(me);
  const notifs = allNotifs.filter(n => (n.to === me || n.to === String(me)) && !n.read);

  const open = async (n) => {
    // Optimistic mark-read in cache
    queryClient.setQueryData(KEYS.notifs(me), (old = []) =>
      old.map(x => x.id === n.id ? { ...x, read: true } : x)
    );
    api.put(`/notifications/${n.id}/read`).catch(() => {});
    dispatch({ type: 'CLOSE_TRAY' });

    const route = n.page === 'home' ? '/' : `/${n.page}`;
    navigate(route);

    if (n.ref) {
      dispatch({ type: 'SET_SEL', payload: n.ref });
      // Invalidate the relevant resource so detail panel sees fresh data
      if (n.page === 'leave') queryClient.invalidateQueries({ queryKey: KEYS.leave });
      else if (n.page === 'requests') queryClient.invalidateQueries({ queryKey: KEYS.requests });
      else if (n.page === 'activities') queryClient.invalidateQueries({ queryKey: KEYS.activities });
      dispatch({ type: 'SET_SEL', payload: n.ref });
    }
  };

  const markAllRead = async () => {
    try {
      await api.put(`/notifications/read-all/${me}`);
      queryClient.invalidateQueries({ queryKey: KEYS.notifs(me) });
    } catch {}
  };

  return (
    <div className="tray" role="dialog" aria-label="Notifications">
      <div className="chead">
        <h3 style={{ fontSize: 15 }}>Notifications</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {notifs.some(n => !n.read) && (
            <button
              className="btn ghost"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={markAllRead}
            >
              Mark all read
            </button>
          )}
          <button
            className="btn ghost"
            style={{ padding: '4px 8px', fontSize: 13 }}
            onClick={() => dispatch({ type: 'CLOSE_TRAY' })}
            aria-label="Close notifications"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      {notifs.length === 0 && (
        <div className="empty" style={{ padding: 'var(--s8) var(--s6)' }}>
          No notifications
        </div>
      )}

      {notifs.map(n => (
        <button
          key={n.id}
          className={`nitem ${!n.read ? 'unread' : ''}`}
          onClick={() => open(n)}
        >
          <div className="ni">
            <Icon name="bell" size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
            <div className="small muted">{n.body}</div>
            <div className="small muted">{timeAgo(n.at)}</div>
          </div>
          {!n.read && <div className="ud" />}
        </button>
      ))}
    </div>
  );
}

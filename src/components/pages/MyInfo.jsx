import { useApp } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { DESIG, ROLE_LABEL } from '../../data/mockData';

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

export default function MyInfo() {
  const { me } = useApp();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Account</span>
          <h1>My Information</h1>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <div style={{ display: 'flex', gap: 'var(--s4)', alignItems: 'center' }}>
            <div className="avatar" style={{ width: 72, height: 72, fontSize: 26 }}>{initials}</div>
            <div>
              <h2 style={{ fontSize: 22 }}>{user.name}</h2>
              <div className="muted">{DESIG[user.des] ?? user.des} · {user.rank}</div>
              <div className="small muted" style={{ marginTop: 4 }}>{ROLE_LABEL[user.role]}</div>
            </div>
          </div>
          <dl className="kv" style={{ marginTop: 'var(--s4)' }}>
            <dt>PSN</dt><dd className="num">{user.psn}</dd>
            <dt>Department</dt><dd>{user.dept}</dd>
            <dt>Appointment type</dt><dd>{user.appt}</dd>
            <dt>Date joined</dt><dd>{user.joined}</dd>
            <dt>Email</dt><dd>{user.email}</dd>
            <dt>Phone</dt><dd>{user.phone}</dd>
            <dt>Status</dt><dd>{user.status}</dd>
          </dl>
        </div>

        <div className="stack">
          <div className="card kpi">
            <span className="overline">Gross monthly salary</span>
            <span className="v">{naira(user.gross)}</span>
          </div>
          <div className="card">
            <h3>System role</h3>
            <p style={{ fontSize: 14 }}>
              You are signed in as <strong>{ROLE_LABEL[user.role]}</strong>.
              Your role determines which modules and actions are available to you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

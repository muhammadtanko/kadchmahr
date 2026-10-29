import { useNavigate } from 'react-router-dom';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

const SUPER_ROLES = ['Administrator', 'Admin', 'DG'];

function statusOf(kind, item) {
  if (kind === 'request') {
    const stages = ['Draft', 'Pending recommendation', 'Pending review', 'Pending authorisation', 'Authorised', 'Rejected'];
    return stages[item.stage] ?? 'Draft';
  }
  if (kind === 'payroll') {
    const stages = ['Pending accounts', 'Pending DAF', 'Pending audit', 'Pending DG approval', 'Approved'];
    return stages[item.stage] ?? 'Draft';
  }
  if (kind === 'capitation') {
    const stages = ['Pending accounts', 'Pending DAF', 'Pending audit', 'Pending DG approval', 'Approved'];
    return stages[item.stage] ?? 'Draft';
  }
  if (kind === 'activity') {
    const stages = ['Draft', 'Pending dept head', 'Pending admin', 'Approved — pending report', 'Completed', 'Rejected'];
    return stages[item.stage] ?? 'Draft';
  }
  return 'Pending';
}

function titleOf(kind, item) {
  if (kind === 'request') return item.head;
  if (kind === 'payroll') return `Payroll run — ${item.period}`;
  if (kind === 'capitation') return `Capitation batch — ${item.period}`;
  if (kind === 'activity') return item.title;
  if (kind === 'extmemo') return item.subject;
  return item.id;
}

function buildQueue(data, role, me, isSuper) {
  const q = [];
  const REQUEST_STAGES = ['owner', 'Department_Head', 'DAF', 'Accounts', 'Auditor', 'DG'];
  const PAYROLL_STAGES = ['Accounts', 'DAF', 'Auditor', 'DG'];
  const ACT_STAGES = ['owner', 'Department_Head', 'Admin', 'DG'];

  if (!isSuper) {
    data.requests.forEach(r => {
      const stageRole = REQUEST_STAGES[r.stage];
      if (stageRole === role && r.stage > 0) q.push({ kind: 'request', it: r, page: 'requests' });
    });
    data.payroll.forEach(r => {
      const stageRole = PAYROLL_STAGES[r.stage];
      if (stageRole === role) q.push({ kind: 'payroll', it: r, page: 'payroll' });
    });
    data.capitation.forEach(r => {
      const stageRole = PAYROLL_STAGES[r.stage];
      if (stageRole === role) q.push({ kind: 'capitation', it: r, page: 'capitation' });
    });
    data.activities.forEach(r => {
      const stageRole = ACT_STAGES[r.stage];
      if ((stageRole === role || (stageRole === 'owner' && r.owner === me)) && r.stage > 0)
        q.push({ kind: 'activity', it: r, page: 'activities' });
    });
    data.memos.filter(m => m.type === 'External').forEach(r => {
      if (r.stage === 0 && ['Administrator', 'Admin'].includes(role))
        q.push({ kind: 'extmemo', it: r, page: 'memos' });
    });
    data.tickets.forEach(t => {
      if ((role === t.track) && ['Open', 'In Progress'].includes(t.status))
        q.push({ kind: 'ticket', it: t, page: 'service' });
      else if (t.by === me && t.status === 'Resolved')
        q.push({ kind: 'ticket', it: t, page: 'service' });
    });
  }
  return q;
}

const MODULE_LABELS = {
  requests: 'Financial Requests',
  payroll: 'Payroll',
  capitation: 'Capitation',
  activities: 'Activities',
  memos: 'Memos',
  service: 'Service Requests',
};

export default function Home() {
  const { me } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const navigate = useNavigate();
  const user = data.staff.find(s => s.id === me);
  const role = user?.role ?? '';
  const isSuper = SUPER_ROLES.includes(role);

  const queue = buildQueue(data, role, me, isSuper);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Home</span>
          <h1>{greeting()}, {user?.name.split(' ')[0]}</h1>
        </div>
      </div>

      <div className="card">
        <div className="chead">
          <h3>Your action queue</h3>
          {queue.length > 0 && (
            <span className="tag gold">{queue.length} item{queue.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {queue.length > 0 ? (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Item</th>
                  <th>Module</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((x, i) => {
                  const st = x.kind === 'ticket' ? x.it.status : statusOf(x.kind, x.it);
                  const t = x.kind === 'ticket' ? x.it.title : titleOf(x.kind, x.it);
                  return (
                    <tr
                      key={i}
                      className="click"
                      onClick={() => { dispatch({ type: 'SET_SEL', payload: x.it.id }); navigate(x.page === 'home' ? '/' : `/${x.page}`); }}
                    >
                      <td className="num" style={{ fontWeight: 600 }}>{x.it.id}</td>
                      <td>{t}</td>
                      <td className="muted">{MODULE_LABELS[x.page] ?? x.page}</td>
                      <td><Pill status={st} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <Icon name="check" size={32} style={{ display: 'block', margin: '0 auto var(--s3)' }} />
            <p>Nothing is waiting for you. Items appear here when a request, run, batch or ticket reaches your stage.</p>
          </div>
        )}
      </div>

      <div className="grid g4">
        <QuickCard title="Financial Requests" icon="money" page="requests" navigate={navigate} />
        <QuickCard title="Payroll" icon="doc" page="payroll" navigate={navigate} />
        <QuickCard title="Activities" icon="event" page="activities" navigate={navigate} />
        <QuickCard title="Memos" icon="mail" page="memos" navigate={navigate} />
      </div>
    </>
  );
}

function QuickCard({ title, icon, page, navigate }) {
  return (
    <button
      className="card"
      style={{ cursor: 'pointer', alignItems: 'flex-start', border: '1px solid var(--border)' }}
      onClick={() => navigate(`/${page}`)}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r-md)',
        background: 'var(--brand-subtle)', color: 'var(--on-brand-subtle)',
        display: 'grid', placeItems: 'center',
      }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
    </button>
  );
}

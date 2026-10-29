import { useNavigate } from 'react-router-dom';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';

const STAGES_REQ = ['Draft', 'Pending recommendation', 'Pending review', 'Pending authorisation', 'Authorised', 'Rejected'];
const STAGES_PAY = ['Pending accounts', 'Pending DAF', 'Pending audit', 'Pending DG approval', 'Approved'];

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

export default function AuditTray() {
  useApp();
  const dispatch = useDispatch();
  const data = useData();
  const navigate = useNavigate();

  const allRequests = data.requests;
  const totalAuth = allRequests.filter(r => r.stage === 4).reduce((a, r) => a + r.amount, 0);
  const pending = allRequests.filter(r => r.stage > 0 && r.stage < 4).length;

  return (
    <>
      <div className="phead">
        <div>
          <span className="overline">Audit</span>
          <h1>Audit Tray</h1>
        </div>
      </div>

      <div className="grid g3">
        <div className="card kpi">
          <span className="overline">Total authorised requests</span>
          <span className="v">{naira(totalAuth)}</span>
        </div>
        <div className="card kpi">
          <span className="overline">Pending requests</span>
          <span className="v accent">{pending}</span>
        </div>
        <div className="card kpi">
          <span className="overline">Payroll runs (Oct 2026)</span>
          <span className="v">{data.payroll.length}</span>
        </div>
      </div>

      <div className="card flush">
        <div className="chead"><h3>All financial requests</h3></div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Subject</th>
                <th>Status</th>
                <th className="r">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {allRequests.map(r => (
                <tr key={r.id} className="click" onClick={() => { dispatch({ type: 'SET_SEL', payload: r.id }); navigate('/requests'); }}>
                  <td className="num" style={{ fontWeight: 600 }}>{r.id}</td>
                  <td>{r.head}</td>
                  <td><Pill status={STAGES_REQ[r.stage]} /></td>
                  <td className="r num">{naira(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card flush">
        <div className="chead"><h3>Payroll runs</h3></div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Period</th>
                <th>Status</th>
                <th className="r">Total (₦)</th>
              </tr>
            </thead>
            <tbody>
              {data.payroll.map(p => {
                const total = p.lines.reduce((a, l) => a + l.gross, 0);
                return (
                  <tr key={p.id} className="click" onClick={() => { dispatch({ type: 'SET_SEL', payload: p.id }); navigate('/payroll'); }}>
                    <td className="num" style={{ fontWeight: 600 }}>{p.id}</td>
                    <td>{p.period}</td>
                    <td><Pill status={STAGES_PAY[p.stage] ?? 'Approved'} /></td>
                    <td className="r num">{naira(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

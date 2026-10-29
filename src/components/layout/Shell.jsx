import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useApp, useDispatch } from '../../context/AppContext';
import Toast from '../ui/Toast';

// Page components
import NotifTray from './NotifTray';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Requests from '../pages/Requests';
import AuditTray from '../pages/AuditTray';
import Payroll from '../pages/Payroll';
import Capitation from '../pages/Capitation';
import Activities from '../pages/Activities';
import Memos from '../pages/Memos';
import Staff from '../pages/Staff';
import Meetings from '../pages/Meetings';
import Documents from '../pages/Documents';
import Messaging from '../pages/Messaging';
import Service from '../pages/Service';
import Assets from '../pages/Assets';
import MyInfo from '../pages/MyInfo';
import Calendar from '../pages/Calendar';
import Leave from '../pages/Leave';

export default function Shell() {
  const { tray } = useApp();
  const dispatch = useDispatch();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar onMenuToggle={() => setNavOpen(v => !v)} />

      {navOpen && (
        <div
          className="scrim"
          style={{ zIndex: 30 }}
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {tray && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => dispatch({ type: 'CLOSE_TRAY' })}
          aria-hidden="true"
        />
      )}

      <div className="shell" style={{ flex: 1 }}>
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="main" role="main">
          <div className="wrap">
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/requests"    element={<Requests />} />
              <Route path="/audit"       element={<AuditTray />} />
              <Route path="/payroll"     element={<Payroll />} />
              <Route path="/capitation"  element={<Capitation />} />
              <Route path="/activities"  element={<Activities />} />
              <Route path="/memos"       element={<Memos />} />
              <Route path="/staff"       element={<Staff />} />
              <Route path="/meetings"    element={<Meetings />} />
              <Route path="/calendar"    element={<Calendar />} />
              <Route path="/leave"       element={<Leave />} />
              <Route path="/dms"         element={<Documents />} />
              <Route path="/messaging"   element={<Messaging />} />
              <Route path="/service"     element={<Service />} />
              <Route path="/assets"      element={<Assets />} />
              <Route path="/myinfo"      element={<MyInfo />} />
              <Route path="*"            element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {tray && <NotifTray />}
      <Toast />
    </div>
  );
}

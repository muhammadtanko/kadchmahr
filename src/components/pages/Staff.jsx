import { useState } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api } from '../../api';
import Pill from '../ui/Pill';
import Icon from '../ui/Icon';
import { DESIG, DEPTS } from '../../data/mockData';

const ROLES       = ['User', 'Accounts', 'Auditor', 'DG', 'Admin', 'Administrator'];
const DESIGNATIONS = ['Staff', 'Department_Head', 'DG'];
const APPTS       = ['Permanent', 'Temporary', 'Adhoc', 'Nysc'];
const DEPTS_BE    = ['Business_Development', 'ICT', 'Operations', 'Admin', 'Accounts', 'Finance/Audit', 'Planning'];
const GL_LEVELS   = Array.from({ length: 17 }, (_, i) => `GL ${String(i + 1).padStart(2, '0')}`);
const GENDERS     = ['Male', 'Female'];
const QUALIFS     = ['SSCE', 'OND', 'HND', 'B.Sc', 'B.A', 'B.Ed', 'PGD', 'M.Sc', 'MBA', 'M.A', 'Ph.D'];
const BANKS       = ['Access Bank', 'Zenith Bank', 'GTBank', 'First Bank', 'UBA', 'Fidelity Bank', 'Sterling Bank', 'Polaris Bank', 'Stanbic IBTC', 'Union Bank', 'Wema Bank', 'Keystone Bank', 'Heritage Bank', 'Ecobank', 'FCMB'];

// Shared input style — defined once at module level so React never remounts inputs
const IST = { fontSize: 13, padding: '7px 10px', height: 34, width: '100%', boxSizing: 'border-box' };

function FW({ label, span, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: span ? '1 / -1' : undefined }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{hint}</span>}
    </label>
  );
}

function SH({ children }) {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brand-text)' }}>{children}</span>
    </div>
  );
}

const DEFAULT_PASSWORD = 'Kadchma@2025';

const BLANK = {
  firstName: '', middleName: '', lastName: '',
  gender: '', dob: '',
  email: '', phoneNumber: '', emergencyContact: '',
  department: DEPTS_BE[0], designation: 'Staff', role: 'User', ApptType: 'Permanent',
  gradeLevel: 'GL 08', step: '', cadre: '', rank: '',
  psn: '', nNumber: '', openFileNum: '', secFileNum: '',
  bankName: '', bankAccountNumber: '',
  nin: '', bvn: '',
  highestQualification: '',
  employmentDate: '', dateofFirstAppointment: '', dateofConfirmation: '',
};

const ADD_SECTIONS = [{ label: 'Personal' }, { label: 'Employment' }, { label: 'Bank & ID' }];

function AddStaffDialog({ onClose, data, dispatch }) {
  const [form, setForm] = useState(BLANK);
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaveError(''); };

  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ') || 'New Staff';
  const initials = form.firstName && form.lastName
    ? (form.firstName[0] + form.lastName[0]).toUpperCase()
    : '?';

  const sel = (k, opts, placeholder) => (
    <select value={form[k]} onChange={e => set(k, e.target.value)} style={IST}>
      {placeholder && <option value="">{placeholder}</option>}
      {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
    </select>
  );

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setSaveError('First name, last name and email are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const result = await api.post('/users/register', {
        firstName:              form.firstName.trim(),
        middleName:             form.middleName.trim(),
        lastName:               form.lastName.trim(),
        email:                  form.email.trim().toLowerCase(),
        password:               DEFAULT_PASSWORD,
        gender:                 form.gender,
        phoneNumber:            form.phoneNumber.trim(),
        emergencyContact:       form.emergencyContact.trim(),
        department:             form.department,
        designation:            form.designation,
        role:                   form.role,
        ApptType:               form.ApptType,
        gradeLevel:             form.gradeLevel,
        step:                   form.step.trim(),
        cadre:                  form.cadre.trim(),
        rank:                   form.rank.trim(),
        psn:                    form.psn.trim(),
        nNumber:                form.nNumber.trim(),
        openFileNum:            form.openFileNum.trim(),
        secFileNum:             form.secFileNum.trim(),
        bankName:               form.bankName,
        bankAccountNumber:      form.bankAccountNumber.trim(),
        nin:                    form.nin.trim(),
        bvn:                    form.bvn.trim(),
        highestQualification:   form.highestQualification,
        employmentDate:         form.employmentDate || undefined,
        dateofFirstAppointment: form.dateofFirstAppointment || undefined,
        dateofConfirmation:     form.dateofConfirmation || undefined,
        status:                 'Active',
      });
      const created = result?.data ?? result;
      if (created?._id) {
        queryClient.invalidateQueries({ queryKey: KEYS.staff });
      }
      setDone(true);
    } catch (err) {
      setSaveError(err.message ?? 'Registration failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Success screen ── */
  if (done) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
        <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(440px, 100%)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ background: 'var(--brand)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22, fontWeight: 700, color: 'var(--on-brand)' }}>
              {initials}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--on-brand)' }}>{fullName}</div>
            <div style={{ fontSize: 13, color: 'var(--on-brand)', opacity: 0.75, marginTop: 4 }}>Registered successfully</div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 12 }}>Share these sign-in details with the staff member:</div>
            <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 13 }}>
              <span style={{ color: 'var(--ink-muted)', fontWeight: 600 }}>Email</span>
              <span style={{ fontFamily: 'monospace' }}>{form.email.trim().toLowerCase()}</span>
              <span style={{ color: 'var(--ink-muted)', fontWeight: 600 }}>Password</span>
              <span style={{ fontFamily: 'monospace' }}>{DEFAULT_PASSWORD}</span>
            </div>
            <button className="btn pri" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.email.trim();
  const isDG = form.designation === 'DG' || form.role === 'DG';

  const sectionContent = [
    /* 0 — Personal */
    <>
      <SH>Name</SH>
      <FW label="First name *"><input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Amina" style={IST} autoFocus /></FW>
      <FW label="Middle name"><input value={form.middleName} onChange={e => set('middleName', e.target.value)} placeholder="(optional)" style={IST} /></FW>
      <FW label="Last name *"><input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Yusuf" style={IST} /></FW>
      <FW label="Gender">{sel('gender', GENDERS, 'Select…')}</FW>
      <SH>Contact</SH>
      <FW label="Email address *" span><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="a.yusuf@kadchma.gov.ng" style={IST} /></FW>
      <FW label="Phone number"><input value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="080XXXXXXXX" style={IST} /></FW>
      <FW label="Emergency contact"><input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} placeholder="Name / phone" style={IST} /></FW>
      <SH>Background</SH>
      <FW label="Date of birth"><input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} style={IST} /></FW>
      <FW label="Highest qualification">{sel('highestQualification', QUALIFS, 'Select…')}</FW>
    </>,

    /* 1 — Employment */
    <>
      <SH>Position</SH>
      <FW label="Department">
        <select value={form.department} onChange={e => set('department', e.target.value)} style={IST}>
          {isDG && <option value="">None</option>}
          {DEPTS_BE.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
      </FW>
      <FW label="Designation">{sel('designation', DESIGNATIONS)}</FW>
      <FW label="System role">{sel('role', ROLES)}</FW>
      <FW label="Appointment type">{sel('ApptType', APPTS)}</FW>
      <SH>Grade & Rank</SH>
      <FW label="Grade level">{sel('gradeLevel', GL_LEVELS)}</FW>
      <FW label="Step"><input value={form.step} onChange={e => set('step', e.target.value)} placeholder="e.g. 3" style={IST} /></FW>
      <FW label="Cadre"><input value={form.cadre} onChange={e => set('cadre', e.target.value)} placeholder="e.g. Senior Executive" style={IST} /></FW>
      <FW label="Rank / title"><input value={form.rank} onChange={e => set('rank', e.target.value)} placeholder="e.g. Principal Officer" style={IST} /></FW>
      <SH>File Numbers</SH>
      <FW label="PSN"><input value={form.psn} onChange={e => set('psn', e.target.value)} placeholder="KD/PSN/XXXXX" style={IST} /></FW>
      <FW label="N-Number"><input value={form.nNumber} onChange={e => set('nNumber', e.target.value)} placeholder="N/XXXXX" style={IST} /></FW>
      <FW label="Open file no."><input value={form.openFileNum} onChange={e => set('openFileNum', e.target.value)} style={IST} /></FW>
      <FW label="Secondary file no."><input value={form.secFileNum} onChange={e => set('secFileNum', e.target.value)} style={IST} /></FW>
      <SH>Dates</SH>
      <FW label="Employment date"><input type="date" value={form.employmentDate} onChange={e => set('employmentDate', e.target.value)} style={IST} /></FW>
      <FW label="Date of first appt."><input type="date" value={form.dateofFirstAppointment} onChange={e => set('dateofFirstAppointment', e.target.value)} style={IST} /></FW>
      <FW label="Date of confirmation"><input type="date" value={form.dateofConfirmation} onChange={e => set('dateofConfirmation', e.target.value)} style={IST} /></FW>
    </>,

    /* 2 — Bank & Identity */
    <>
      <SH>Bank Details</SH>
      <FW label="Bank name" span>{sel('bankName', BANKS, 'Select bank…')}</FW>
      <FW label="Account number" span hint="10 digits"><input value={form.bankAccountNumber} onChange={e => set('bankAccountNumber', e.target.value)} placeholder="0123456789" maxLength={10} style={IST} /></FW>
      <SH>Identity</SH>
      <FW label="NIN" hint="11 digits"><input value={form.nin} onChange={e => set('nin', e.target.value)} placeholder="12345678901" maxLength={11} style={IST} /></FW>
      <FW label="BVN" hint="11 digits"><input value={form.bvn} onChange={e => set('bvn', e.target.value)} placeholder="12345678901" maxLength={11} style={IST} /></FW>
      <SH>Default Access</SH>
      <FW label="Password" span hint="Staff will use this to sign in for the first time">
        <input value={DEFAULT_PASSWORD} readOnly style={{ ...IST, fontFamily: 'monospace', background: 'var(--surface-sunken)', cursor: 'default' }} />
      </FW>
    </>,
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(680px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header with live avatar ── */}
        <div style={{ background: 'var(--brand)', padding: '20px 24px 0', position: 'relative' }}>
          <button
            className="iconbtn"
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, color: 'var(--on-brand)', opacity: 0.8 }}
          >
            <Icon name="close" size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'var(--on-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--on-brand)' }}>{fullName}</div>
              <div style={{ fontSize: 13, color: 'var(--on-brand)', opacity: 0.75, marginTop: 2 }}>
                {form.department.replace(/_/g, ' ')} · {form.gradeLevel}
              </div>
            </div>
          </div>

          {/* Section tabs on the header */}
          <div style={{ display: 'flex', gap: 4 }}>
            {ADD_SECTIONS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSection(i)}
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: section === i ? 'var(--surface-raised)' : 'transparent',
                  color: section === i ? 'var(--ink)' : 'var(--on-brand)',
                  opacity: section === i ? 1 : 0.75,
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  transition: 'background 0.15s, opacity 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
            {sectionContent[section]}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn ghost" onClick={() => setSection(s => Math.max(0, s - 1))} disabled={section === 0} style={{ fontSize: 13 }}>← Back</button>
            <button className="btn ghost" onClick={() => setSection(s => Math.min(ADD_SECTIONS.length - 1, s + 1))} disabled={section === ADD_SECTIONS.length - 1} style={{ fontSize: 13 }}>Next →</button>
          </div>

          {/* step dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {ADD_SECTIONS.map((_, i) => (
              <div key={i} onClick={() => setSection(i)} style={{ width: i === section ? 20 : 7, height: 7, borderRadius: 4, cursor: 'pointer', background: i === section ? 'var(--brand)' : 'var(--border)', transition: 'width 0.2s, background 0.2s' }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saveError && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{saveError}</span>}
            <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn pri" onClick={submit} disabled={!canSubmit || saving}>
              <Icon name="plus" size={15} /> {saving ? 'Registering…' : 'Register staff'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditStaffDialog({ staff, data, dispatch, onClose }) {
  const initForm = {
    firstName: staff.name?.split(' ')[0] ?? '',
    middleName: staff.name?.split(' ').slice(1, -1).join(' ') ?? '',
    lastName: staff.name?.split(' ').slice(-1)[0] ?? '',
    gender: staff.gender ?? '',
    dob: staff.dob ?? '',
    email: staff.email ?? '',
    phoneNumber: staff.phone ?? '',
    emergencyContact: staff.emergencyContact ?? '',
    department: staff.dept ?? DEPTS_BE[0],
    designation: staff.designation ?? staff.des ?? 'Staff',
    role: staff.role ?? 'User',
    ApptType: staff.appt ?? 'Permanent',
    gradeLevel: staff.rank ?? 'GL 08',
    status: staff.status ?? 'Active',
    step: staff.step ?? '',
    cadre: staff.cadre ?? '',
    rank: staff.rank ?? '',
    psn: staff.psn !== '—' ? (staff.psn ?? '') : '',
    nNumber: staff.nNumber ?? '',
    openFileNum: staff.openFileNum ?? '',
    secFileNum: staff.secFileNum ?? '',
    bankName: staff.bankName ?? '',
    bankAccountNumber: staff.bankAccountNumber ?? '',
    nin: staff.nin ?? '',
    bvn: staff.bvn ?? '',
    highestQualification: staff.highestQualification ?? '',
    employmentDate: staff.joined ?? '',
    dateofFirstAppointment: staff.dateofFirstAppointment ?? '',
    dateofConfirmation: staff.dateofConfirmation ?? '',
    gross: staff.gross ?? '',
  };

  const [form, setForm] = useState(initForm);
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ') || staff.name;
  const initials = staff.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setSaving(true);
    setSaveError('');

    const backendBody = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      dob: form.dob,
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      emergencyContact: form.emergencyContact.trim(),
      department: form.department,
      designation: form.designation,
      role: form.role,
      ApptType: form.ApptType,
      status: form.status,
      gradeLevel: form.gradeLevel,
      step: form.step,
      cadre: form.cadre,
      psn: form.psn.trim() || '—',
      nNumber: form.nNumber,
      openFileNum: form.openFileNum,
      secFileNum: form.secFileNum,
      bankName: form.bankName,
      bankAccountNumber: form.bankAccountNumber,
      nin: form.nin,
      bvn: form.bvn,
      highestQualification: form.highestQualification,
      employmentDate: form.employmentDate,
      dateofFirstAppointment: form.dateofFirstAppointment,
      dateofConfirmation: form.dateofConfirmation,
    };

    try {
      await api.put('/users/' + staff.id, backendBody);
    } catch (err) {
      setSaveError(err.message ?? 'Save failed');
      setSaving(false);
      return;
    }

    const updatedStaff = {
      ...staff,
      name: fullName,
      email: form.email.trim(),
      phone: form.phoneNumber.trim(),
      dept: form.department,
      des: form.designation,
      rank: form.gradeLevel,
      role: form.role,
      appt: form.ApptType,
      gross: Number(form.gross) || 0,
      status: form.status,
      psn: form.psn.trim() || '—',
      joined: form.employmentDate || staff.joined,
      gender: form.gender,
      nin: form.nin,
      bvn: form.bvn,
      bankName: form.bankName,
      bankAccountNumber: form.bankAccountNumber,
      nNumber: form.nNumber,
      cadre: form.cadre,
      step: form.step,
      highestQualification: form.highestQualification,
    };

    queryClient.invalidateQueries({ queryKey: KEYS.staff });
    dispatch({ type: 'SHOW_TOAST', payload: `${fullName} updated` });
    setSaving(false);
    onClose();
  };

  const sections = [
    { label: 'Personal' },
    { label: 'Employment' },
    { label: 'Bank & ID' },
  ];

  const sel = (k, opts, placeholder) => (
    <select value={form[k]} onChange={e => set(k, e.target.value)} style={IST}>
      {placeholder && <option value="">{placeholder}</option>}
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const sectionContent = [
    /* 0 — Personal */
    <>
      <SH>Name</SH>
      <FW label="First name *"><input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Amina" style={IST} /></FW>
      <FW label="Middle name"><input value={form.middleName} onChange={e => set('middleName', e.target.value)} placeholder="(optional)" style={IST} /></FW>
      <FW label="Last name *"><input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Yusuf" style={IST} /></FW>
      <FW label="Gender">{sel('gender', GENDERS, 'Select…')}</FW>
      <SH>Contact</SH>
      <FW label="Email *" span><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="a.yusuf@kadchma.gov.ng" style={IST} /></FW>
      <FW label="Phone number"><input value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="080XXXXXXXX" style={IST} /></FW>
      <FW label="Emergency contact"><input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} placeholder="Name / phone" style={IST} /></FW>
      <SH>Background</SH>
      <FW label="Date of birth"><input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} style={IST} /></FW>
      <FW label="Highest qualification">{sel('highestQualification', QUALIFS, 'Select…')}</FW>
    </>,

    /* 1 — Employment */
    <>
      <SH>Position</SH>
      <FW label="Department">{sel('department', DEPTS_BE)}</FW>
      <FW label="Designation">{sel('designation', DESIGNATIONS)}</FW>
      <FW label="System role">{sel('role', ROLES)}</FW>
      <FW label="Appointment type">{sel('ApptType', APPTS)}</FW>
      <FW label="Status">{sel('status', ['Active', 'Pending', 'Disabled'])}</FW>
      <SH>Grade & Rank</SH>
      <FW label="Grade level">{sel('gradeLevel', GL_LEVELS)}</FW>
      <FW label="Step"><input value={form.step} onChange={e => set('step', e.target.value)} placeholder="e.g. 3" style={IST} /></FW>
      <FW label="Cadre"><input value={form.cadre} onChange={e => set('cadre', e.target.value)} placeholder="e.g. Senior Executive" style={IST} /></FW>
      <SH>File Numbers</SH>
      <FW label="PSN"><input value={form.psn} onChange={e => set('psn', e.target.value)} placeholder="KD/PSN/XXXXX" style={IST} /></FW>
      <FW label="N-Number"><input value={form.nNumber} onChange={e => set('nNumber', e.target.value)} placeholder="N/XXXXX" style={IST} /></FW>
      <FW label="Open file no."><input value={form.openFileNum} onChange={e => set('openFileNum', e.target.value)} style={IST} /></FW>
      <FW label="Secondary file no."><input value={form.secFileNum} onChange={e => set('secFileNum', e.target.value)} style={IST} /></FW>
      <SH>Dates & Salary</SH>
      <FW label="Employment date"><input type="date" value={form.employmentDate} onChange={e => set('employmentDate', e.target.value)} style={IST} /></FW>
      <FW label="Date of first appt."><input type="date" value={form.dateofFirstAppointment} onChange={e => set('dateofFirstAppointment', e.target.value)} style={IST} /></FW>
      <FW label="Date of confirmation"><input type="date" value={form.dateofConfirmation} onChange={e => set('dateofConfirmation', e.target.value)} style={IST} /></FW>
      <FW label="Gross salary (₦)"><input type="number" value={form.gross} onChange={e => set('gross', e.target.value)} placeholder="0" min="0" style={IST} /></FW>
    </>,

    /* 2 — Bank & Identity */
    <>
      <SH>Bank Details</SH>
      <FW label="Bank name" span>{sel('bankName', BANKS, 'Select bank…')}</FW>
      <FW label="Account number" span hint="10 digits"><input value={form.bankAccountNumber} onChange={e => set('bankAccountNumber', e.target.value)} placeholder="0123456789" maxLength={10} style={IST} /></FW>
      <SH>Identity</SH>
      <FW label="NIN" hint="11 digits"><input value={form.nin} onChange={e => set('nin', e.target.value)} placeholder="12345678901" maxLength={11} style={IST} /></FW>
      <FW label="BVN" hint="11 digits"><input value={form.bvn} onChange={e => set('bvn', e.target.value)} placeholder="12345678901" maxLength={11} style={IST} /></FW>
    </>,
  ];

  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(680px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header with avatar ── */}
        <div style={{ background: 'var(--brand)', padding: '20px 24px 0', position: 'relative' }}>
          <button
            className="iconbtn"
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, color: 'var(--on-brand)', opacity: 0.8 }}
          >
            <Icon name="close" size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: 'var(--on-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--on-brand)' }}>{fullName}</div>
              <div style={{ fontSize: 13, color: 'var(--on-brand)', opacity: 0.75, marginTop: 2 }}>
                {form.department} · {form.gradeLevel}
              </div>
            </div>
          </div>

          {/* Section tabs on the header */}
          <div style={{ display: 'flex', gap: 4 }}>
            {sections.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSection(i)}
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: section === i ? 'var(--surface-raised)' : 'transparent',
                  color: section === i ? 'var(--ink)' : 'var(--on-brand)',
                  opacity: section === i ? 1 : 0.75,
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  transition: 'background 0.15s, opacity 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
            {sectionContent[section]}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', borderTop: '1px solid var(--border)',
          background: 'var(--surface)', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn ghost" onClick={() => setSection(s => Math.max(0, s - 1))} disabled={section === 0} style={{ fontSize: 13 }}>
              ← Back
            </button>
            <button className="btn ghost" onClick={() => setSection(s => Math.min(sections.length - 1, s + 1))} disabled={section === sections.length - 1} style={{ fontSize: 13 }}>
              Next →
            </button>
          </div>

          {/* step dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {sections.map((_, i) => (
              <div
                key={i}
                onClick={() => setSection(i)}
                style={{
                  width: i === section ? 20 : 7, height: 7, borderRadius: 4, cursor: 'pointer',
                  background: i === section ? 'var(--brand)' : 'var(--border)',
                  transition: 'width 0.2s, background 0.2s',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saveError && <span style={{ fontSize: 12, color: 'var(--danger, #ef4444)' }}>{saveError}</span>}
            <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn pri" onClick={submit} disabled={!canSubmit || saving}>
              <Icon name="check" size={15} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const { me, sel } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const user = data.staff.find(s => s.id === me);
  const role = ['Admin', 'Administrator', 'DG'].includes(user?.role ?? '') ? (user?.role ?? '') : user?.des === 'Department_Head' ? 'Department_Head' : (user?.role ?? '');

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  const list = data.staff.filter(s => {
    if (filterDept && s.dept !== filterDept) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.psn.toLowerCase().includes(q) ||
        s.rank.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selected = sel ? data.staff.find(s => s.id === sel) : null;
  if (selected) {
    return <StaffDetail staff={selected} data={data} dispatch={dispatch} />;
  }

  return (
    <>
      {showAdd && <AddStaffDialog onClose={() => setShowAdd(false)} data={data} dispatch={dispatch} />}
      {editStaff && <EditStaffDialog staff={editStaff} data={data} dispatch={dispatch} onClose={() => setEditStaff(null)} />}
      <div className="phead">
        <div>
          <span className="overline">HR</span>
          <h1>Staff</h1>
        </div>
        {['Administrator', 'Admin', 'Department_Head'].includes(role) && (
          <button className="btn pri" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={16} /> Add staff
          </button>
        )}
      </div>

      <div className="card flush">
        <div className="chead">
          <div className="filters">
            <input
              type="search"
              placeholder="Search by name, rank or PSN"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 'auto' }}>
              <option value="">Department: all</option>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="">Status: all</option>
              {['Active', 'Pending', 'Disabled'].map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="small muted">{list.length} staff</span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>PSN</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Appointment</th>
                <th>Status</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={7} className="empty">No staff found.</td></tr>
              )}
              {list.map(s => (
                <tr key={s.id}>
                  <td className="num" style={{ fontWeight: 600 }}>{s.psn}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.dept}</td>
                  <td>
                    {DESIG[s.des] ?? s.des}
                    <div className="small muted">{s.rank}</div>
                  </td>
                  <td><span className="tag">{s.appt}</span></td>
                  <td><Pill status={s.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--s2)', justifyContent: 'flex-end' }}>
                      <button
                        className="btn ghost"
                        style={{ padding: '4px 6px' }}
                        title="View"
                        onClick={() => dispatch({ type: 'SET_SEL', payload: s.id })}
                      >
                        <Icon name="eye" size={16} />
                      </button>
                      <button
                        className="btn ghost"
                        style={{ padding: '4px 6px' }}
                        title="Edit"
                        onClick={() => setEditStaff(s)}
                      >
                        <Icon name="edit" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const STAGE_LABELS = ['Submitted', 'Recommended', 'Approved by DG', 'Admin Processed', 'Voucher Raised', 'Pre-Audited', 'Payment Released', 'Post-Audited', 'Completed'];
const LEAVE_DAYS = { 'Annual leave': 30, 'Casual leave': 10, 'Sick leave': 14 };

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

function daysBetween(from, to) {
  const d = (new Date(to) - new Date(from)) / 86400000;
  return Math.max(1, Math.round(d) + 1);
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StaffDetail({ staff, data, dispatch }) {
  const [tab, setTab] = useState('profile');
  const initials = staff.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const myLeave     = data.leave.filter(l => l.who === staff.id);
  const myRequests  = data.requests.filter(r => r.owner === staff.id);
  const myAssets    = data.assets.filter(a => a.to === staff.id);
  const myPayLine   = data.payroll.map(run => ({
    period: run.period, stage: run.stage,
    line: run.lines.find(l => l.uid === staff.id),
  })).filter(r => r.line);

  // leave days used by type
  const leaveUsed = {};
  myLeave.filter(l => l.status === 'Approved').forEach(l => {
    leaveUsed[l.type] = (leaveUsed[l.type] || 0) + daysBetween(l.from, l.to);
  });

  return (
    <>
      <div className="phead">
        <div>
          <div className="crumb">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_SEL', payload: null })}>
              <Icon name="arrow_right" size={14} style={{ transform: 'rotate(180deg)' }} /> Staff
            </button>
          </div>
          <h1 style={{ fontSize: 22 }}>{staff.name}</h1>
        </div>
        <Pill status={staff.status} />
      </div>

      {/* header card */}
      <div className="card" style={{ marginBottom: 'var(--s4)' }}>
        <div style={{ display: 'flex', gap: 'var(--s4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 26, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{staff.name}</div>
            <div className="muted" style={{ marginTop: 2 }}>{DESIG[staff.des] ?? staff.des}</div>
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
              <span className="tag">{staff.dept}</span>
              <span className="tag">{staff.rank}</span>
              <span className="tag">{staff.appt}</span>
            </div>
          </div>
          <dl className="kv" style={{ fontSize: 13, minWidth: 240 }}>
            <dt>PSN</dt><dd className="num">{staff.psn}</dd>
            <dt>Email</dt><dd>{staff.email}</dd>
            <dt>Phone</dt><dd>{staff.phone}</dd>
            <dt>Joined</dt><dd>{fmt(staff.joined)}</dd>
          </dl>
        </div>
      </div>

      {/* tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--s4)' }}>
        {[
          { k: 'profile',  label: 'Profile' },
          { k: 'leave',    label: `Leave (${myLeave.length})` },
          { k: 'payroll',  label: `Payroll (${myPayLine.length})` },
          { k: 'assets',   label: `Assets (${myAssets.length})` },
          { k: 'requests', label: `Requests (${myRequests.length})` },
        ].map(t => (
          <button key={t.k} className={`tab${tab === t.k ? ' on' : ''}`} onClick={() => setTab(t.k)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* profile tab */}
      {tab === 'profile' && (
        <div className="split">
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 'var(--s3)' }}>Employment details</div>
            <dl className="kv">
              <dt>Full name</dt><dd>{staff.name}</dd>
              <dt>PSN</dt><dd className="num">{staff.psn}</dd>
              <dt>Department</dt><dd>{staff.dept}</dd>
              <dt>Designation</dt><dd>{DESIG[staff.des] ?? staff.des}</dd>
              <dt>Grade level</dt><dd>{staff.rank}</dd>
              <dt>Appointment</dt><dd>{staff.appt}</dd>
              <dt>Status</dt><dd><Pill status={staff.status} /></dd>
              <dt>Date joined</dt><dd>{fmt(staff.joined)}</dd>
            </dl>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 'var(--s3)' }}>Contact</div>
              <dl className="kv">
                <dt>Email</dt><dd style={{ wordBreak: 'break-all' }}>{staff.email}</dd>
                <dt>Phone</dt><dd>{staff.phone}</dd>
              </dl>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 'var(--s3)' }}>Compensation</div>
              <dl className="kv">
                <dt>Gross salary</dt><dd className="num" style={{ color: 'var(--brand-text)', fontWeight: 700 }}>{naira(staff.gross)}</dd>
              </dl>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 'var(--s3)' }}>Role</div>
              <dl className="kv">
                <dt>System role</dt><dd>{staff.role}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* leave tab */}
      {tab === 'leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          {/* leave balance summary */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 'var(--s3)' }}>Leave balance</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--s4)', marginTop: 'var(--s3)' }}>
              {Object.entries(LEAVE_DAYS).map(([type, total]) => {
                const used = leaveUsed[type] || 0;
                const pct = Math.min(100, Math.round((used / total) * 100));
                return (
                  <div key={type} style={{ padding: 'var(--s3)', background: 'var(--surface-2)', borderRadius: 'var(--r2)' }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 4 }}>{type}</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{total - used} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-muted)' }}>days left</span></div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>{used} used of {total}</div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? 'var(--danger)' : 'var(--brand)', borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* leave records */}
          <div className="card flush">
            <div className="chead"><span style={{ fontWeight: 600 }}>Leave history</span></div>
            {myLeave.length === 0 ? (
              <div style={{ padding: 'var(--s6)', textAlign: 'center', color: 'var(--ink-muted)' }}>No leave records.</div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {myLeave.map(l => (
                      <tr key={l.id}>
                        <td>{l.type}</td>
                        <td>{fmt(l.from)}</td>
                        <td>{fmt(l.to)}</td>
                        <td className="num">{daysBetween(l.from, l.to)}</td>
                        <td><Pill status={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* payroll tab */}
      {tab === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          {myPayLine.length === 0 ? (
            <div className="card"><div className="empty">Not on any payroll run.</div></div>
          ) : myPayLine.map(({ period, stage, line }) => (
            <div className="card" key={period}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--s2)', marginBottom: 'var(--s4)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Payroll — {period}</div>
                  <span className="tag">{stage >= 4 ? 'Paid' : stage >= 3 ? 'DG Approved' : stage >= 2 ? 'Under Review' : 'Pending'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Gross</div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--brand-text)' }}>{naira(line.gross)}</div>
                </div>
              </div>
              <dl className="kv">
                <dt>Department</dt><dd>{line.dept}</dd>
                <dt>Designation</dt><dd>{line.des}</dd>
                <dt>Grade level</dt><dd>{line.rank}</dd>
                <dt>Run status</dt><dd>{STAGE_LABELS[stage - 1] ?? `Stage ${stage}`}</dd>
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* assets tab */}
      {tab === 'assets' && (
        <div className="card flush">
          <div className="chead"><span style={{ fontWeight: 600 }}>Assigned assets</span></div>
          {myAssets.length === 0 ? (
            <div style={{ padding: 'var(--s6)', textAlign: 'center', color: 'var(--ink-muted)' }}>No assets assigned.</div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr><th>Tag</th><th>Item</th><th>Category</th><th>Serial no.</th><th>Acquired</th><th>Value</th><th>Condition</th></tr>
                </thead>
                <tbody>
                  {myAssets.map(a => (
                    <tr key={a.tag}>
                      <td className="num" style={{ fontWeight: 600 }}>{a.tag}</td>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>{a.cat}</td>
                      <td className="num">{a.sn}</td>
                      <td>{fmt(a.bought)}</td>
                      <td className="num">{naira(a.value)}</td>
                      <td><Pill status={a.cond} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* requests tab */}
      {tab === 'requests' && (
        <div className="card flush">
          <div className="chead"><span style={{ fontWeight: 600 }}>Financial requests</span></div>
          {myRequests.length === 0 ? (
            <div style={{ padding: 'var(--s6)', textAlign: 'center', color: 'var(--ink-muted)' }}>No requests submitted.</div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Description</th><th>Amount</th><th>Submitted</th><th>Stage</th></tr>
                </thead>
                <tbody>
                  {myRequests.map(r => (
                    <tr key={r.id}>
                      <td className="num" style={{ fontWeight: 600 }}>{r.id}</td>
                      <td style={{ maxWidth: 320 }}>{r.head}</td>
                      <td className="num">{naira(r.amount)}</td>
                      <td>{fmt(r.created)}</td>
                      <td>
                        {r.rejected
                          ? <Pill status="Rejected" />
                          : r.stage >= 8
                          ? <Pill status="Completed" />
                          : <span className="tag">{STAGE_LABELS[r.stage - 1] ?? `Stage ${r.stage}`}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

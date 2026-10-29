import Icon from './Icon';

const STATUS_MAP = {
  // Requests
  Draft: { cls: 'warn', icon: 'info' },
  'Pending recommendation': { cls: 'warn', icon: 'info' },
  'Pending review': { cls: 'warn', icon: 'info' },
  'Pending authorisation': { cls: 'warn', icon: 'info' },
  Authorised: { cls: 'ok', icon: 'check' },
  Rejected: { cls: 'bad', icon: 'close' },
  // Payroll
  'Pending accounts': { cls: 'warn', icon: 'info' },
  'Pending DAF': { cls: 'warn', icon: 'info' },
  'Pending audit': { cls: 'warn', icon: 'info' },
  'Pending DG approval': { cls: 'warn', icon: 'info' },
  Approved: { cls: 'ok', icon: 'check' },
  // Activities
  'Pending dept head': { cls: 'warn', icon: 'info' },
  'Pending admin': { cls: 'warn', icon: 'info' },
  'Pending DG': { cls: 'warn', icon: 'info' },
  'Approved — pending report': { cls: 'ok', icon: 'check' },
  Completed: { cls: 'ok', icon: 'check' },
  // Tickets
  Open: { cls: 'info', icon: 'info' },
  'In Progress': { cls: 'warn', icon: 'info' },
  Resolved: { cls: 'ok', icon: 'check' },
  Closed: { cls: 'info', icon: 'check' },
  // Staff
  Active: { cls: 'ok', icon: 'check' },
  Pending: { cls: 'warn', icon: 'info' },
  Disabled: { cls: 'bad', icon: 'close' },
  // Generic
  Good: { cls: 'ok', icon: 'check' },
  Fair: { cls: 'warn', icon: 'info' },
  Damaged: { cls: 'bad', icon: 'close' },
};

export default function Pill({ status }) {
  const cfg = STATUS_MAP[status] ?? { cls: 'info', icon: 'info' };
  return (
    <span className={`pill ${cfg.cls}`}>
      <Icon name={cfg.icon} size={14} />
      {status}
    </span>
  );
}

import {
  FaHome, FaTh, FaMoneyBillAlt, FaClipboardList, FaFileAlt,
  FaHospital, FaCalendarAlt, FaEnvelope, FaUsers, FaClock,
  FaFolder, FaComments, FaWrench, FaBox, FaUser, FaBell,
  FaBars, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle,
  FaPlus, FaPaperPlane, FaPaperclip, FaDownload, FaPencilAlt,
  FaTrashAlt, FaEye, FaLock, FaComment, FaPrint, FaArrowRight,
  FaFilter, FaSearch, FaSignOutAlt, FaSun, FaMoon,
} from 'react-icons/fa';
import { MdSpaceDashboard } from "react-icons/md";
const ICONS = {
  home:        FaHome,
  dash:        MdSpaceDashboard,
  money:       FaMoneyBillAlt,
  clip:        FaClipboardList,
  doc:         FaFileAlt,
  hosp:        FaHospital,
  event:       FaCalendarAlt,
  mail:        FaEnvelope,
  group:       FaUsers,
  clock:       FaClock,
  folder:      FaFolder,
  chat:        FaComments,
  wrench:      FaWrench,
  box:         FaBox,
  person:      FaUser,
  bell:        FaBell,
  menu:        FaBars,
  close:       FaTimes,
  check:       FaCheck,
  warn:        FaExclamationTriangle,
  info:        FaInfoCircle,
  plus:        FaPlus,
  send:        FaPaperPlane,
  attach:      FaPaperclip,
  download:    FaDownload,
  edit:        FaPencilAlt,
  trash:       FaTrashAlt,
  eye:         FaEye,
  lock:        FaLock,
  comment:     FaComment,
  print:       FaPrint,
  arrow_right: FaArrowRight,
  filter:      FaFilter,
  search:      FaSearch,
  logout:      FaSignOutAlt,
  sun:         FaSun,
  moon:        FaMoon,
};

export default function Icon({ name, size = 20, className = '', style }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} className={`ic ${className}`} style={style} aria-hidden="true" />;
}

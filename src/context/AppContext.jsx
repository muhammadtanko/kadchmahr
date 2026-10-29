import { createContext, useContext, useReducer } from 'react';
import { getStoredUserId } from '../api';
import { CAPITATION, CONVOS, ASSETS, ACCOUNTS } from '../data/mockData';

const AppContext = createContext(null);
const DispatchContext = createContext(null);

function hasStoredToken() {
  try { return !!localStorage.getItem('kadchma_token'); } catch { return false; }
}

const initialState = {
  me: getStoredUserId() ?? null,
  sel: null,
  tab: null,
  tray: false,
  dialog: null,
  toast: null,
  loggedIn: hasStoredToken(),
  filters: {},
  dmsFolder: 'f1',
  chat: null,
  // mock-only data (no backend) — mutated locally
  assets: ASSETS,
  capitation: CAPITATION,
  convos: CONVOS,
  tickets: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ME':
      return { ...state, me: action.payload, sel: null, tab: null, chat: null };
    case 'SET_SEL':
      return { ...state, sel: action.payload };
    case 'SET_TAB':
      return { ...state, tab: action.payload };
    case 'TOGGLE_TRAY':
      return { ...state, tray: !state.tray };
    case 'CLOSE_TRAY':
      return { ...state, tray: false };
    case 'OPEN_DIALOG':
      return { ...state, dialog: action.payload };
    case 'CLOSE_DIALOG':
      return { ...state, dialog: null };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case 'SET_DMS_FOLDER':
      return { ...state, dmsFolder: action.payload };
    case 'SET_CHAT':
      return { ...state, chat: action.payload };
    case 'SET_LOGGED_IN':
      return { ...state, loggedIn: action.payload };
    case 'UPDATE_DATA':
      return { ...state, [action.key]: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export const useDispatch = () => useContext(DispatchContext);

import { AppProvider, useApp } from './context/AppContext';
import Shell from './components/layout/Shell';
import Login from './components/pages/Login';
import './styles/tokens.css';
import './styles/global.css';
import './styles/shell.css';

function Root() {
  const { loggedIn } = useApp();
  return loggedIn ? <Shell /> : <Login />;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

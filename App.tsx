import React from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { LogProvider } from './context/LogContext';
import { ApiProvider } from './context/ApiContext';

const App: React.FC = () => {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <LogProvider user={user}>
      <ApiProvider>
        <Dashboard user={user} onLogout={logout} />
      </ApiProvider>
    </LogProvider>
  );
};

export default App;
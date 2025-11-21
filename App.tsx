
import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DisclaimerModal from './components/DisclaimerModal';
import { useAuth } from './hooks/useAuth';
import { LogProvider } from './context/LogContext';
import { ApiProvider } from './context/ApiContext';


const App: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Show disclaimer when user logs in
  React.useEffect(() => {
    if (user) {
      setShowDisclaimer(true);
      setDisclaimerAccepted(false);
    }
  }, [user]);

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <LogProvider user={user}>
      <ApiProvider>
        {showDisclaimer && !disclaimerAccepted && (
          <DisclaimerModal onAcknowledge={() => { setDisclaimerAccepted(true); setShowDisclaimer(false); }} />
        )}
        {disclaimerAccepted && <Dashboard user={user} onLogout={logout} />}
      </ApiProvider>
    </LogProvider>
  );
};

export default App;
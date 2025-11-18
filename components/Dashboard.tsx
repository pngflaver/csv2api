
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { View } from '../constants';
import Header from './Header';
import DashboardView from './views/DashboardView';
import ApiDocsView from './views/ApiDocsView';
import AuditLogView from './views/AuditLogView';
import { useLogger } from '../context/LogContext';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const { addLog } = useLogger();

  const handleLogout = () => {
    addLog('LOGOUT', 'User logged out successfully.');
    onLogout();
  };
  
  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardView />;
      case View.API_DOCS:
        return <ApiDocsView />;
      case View.AUDIT_LOG:
        return <AuditLogView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header user={user} onLogout={handleLogout} setView={setCurrentView} currentView={currentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default Dashboard;

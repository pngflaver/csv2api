import React, { useState } from 'react';
import { User } from '../types';
import { View } from '../constants';
import { ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, KeyIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from './ChangePasswordModal';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  setView: (view: View) => void;
  currentView: View;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    <Icon className="h-5 w-5 mr-2" />
    <span>{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ user, onLogout, setView, currentView }) => {
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Midnight Bridge v1.0.0</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <NavItem
                icon={ChartBarIcon}
                label="Dashboard"
                isActive={currentView === View.DASHBOARD}
                onClick={() => setView(View.DASHBOARD)}
              />
              <NavItem
                icon={DocumentTextIcon}
                label="API Docs"
                isActive={currentView === View.API_DOCS}
                onClick={() => setView(View.API_DOCS)}
              />
              {/* Audit Log nav removed */}
            </nav>
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 mr-3 hidden sm:block">
                Welcome, <span className="font-medium">{user.username}</span>
              </span>
              <button
                onClick={() => setChangePasswordModalOpen(true)}
                className="flex items-center p-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Change Password"
              >
                <KeyIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center p-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="ml-2 md:hidden">Logout</span>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile navigation */}
        <nav className="md:hidden p-2 border-t border-gray-200 dark:border-gray-700 flex justify-around">
          <NavItem
                icon={ChartBarIcon}
                label="Dashboard"
                isActive={currentView === View.DASHBOARD}
                onClick={() => setView(View.DASHBOARD)}
              />
              <NavItem
                icon={DocumentTextIcon}
                label="API Docs"
                isActive={currentView === View.API_DOCS}
                onClick={() => setView(View.API_DOCS)}
              />
              <NavItem
                icon={ShieldCheckIcon}
                label="Audit Log"
                isActive={currentView === View.AUDIT_LOG}
                onClick={() => setView(View.AUDIT_LOG)}
              />
        </nav>
      </header>
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setChangePasswordModalOpen(false)} 
      />
    </>
  );
};

export default Header;
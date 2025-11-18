
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LogEntry, LogAction, User } from '../types';
import { LOCAL_STORAGE_LOGS_KEY } from '../constants';

interface LogContextType {
  logs: LogEntry[];
  addLog: (action: LogAction, details: string) => void;
}

const LogContext = createContext<LogContextType | null>(null);

export const useLogger = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogger must be used within a LogProvider');
  }
  return context;
};

interface LogProviderProps {
  children: React.ReactNode;
  user: User;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children, user }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const savedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (error) {
      console.error('Error reading logs from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving logs to localStorage', error);
    }
  }, [logs]);

  const addLog = useCallback((action: LogAction, details: string) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user: user.username,
      action,
      details,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, [user.username]);

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
};

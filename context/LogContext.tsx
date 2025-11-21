
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LogEntry, LogAction, User } from '../types';
import { LOCAL_STORAGE_LOGS_KEY } from '../constants';

interface LogContextType {
  logs: LogEntry[];
  addLog: (action: LogAction, details: string) => void;
  refreshLogs: () => Promise<void>;
  startPolling: (enabled: boolean) => void;
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

  // Listen for storage events so logs refresh across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_LOGS_KEY) {
        try {
          const newLogs = e.newValue ? JSON.parse(e.newValue) : [];
          setLogs(newLogs);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Refresh logs from server-side activity endpoint and merge with local logs
  const refreshLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs', { headers: { 'x-api-key': localStorage.getItem('csv_api_key') || '' } });
      if (res.ok) {
        const serverLogs = await res.json();
        const merged = [
          ...serverLogs.map((s: any) => ({
            id: `srv-${s.timestamp}-${s.path}-${s.status}`,
            timestamp: s.timestamp,
            user: 'server',
            action: s.path,
            details: `method=${s.method} status=${s.status} durationMs=${s.durationMs}`
          })),
          ...logs
        ];
        setLogs(merged);
      }
    } catch (e) {
      // ignore
    }
  }, [logs]);

  // Simple polling control
  const pollRef = React.useRef<number | null>(null);
  const startPolling = useCallback((enabled: boolean) => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (enabled) {
      pollRef.current = window.setInterval(() => {
        refreshLogs();
      }, 3000);
    }
  }, [refreshLogs]);

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
    <LogContext.Provider value={{ logs, addLog, refreshLogs, startPolling }}>
      {children}
    </LogContext.Provider>
  );
};

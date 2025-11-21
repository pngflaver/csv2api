
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CsvData, CsvFileInfo } from '../types';
import { LOCAL_STORAGE_API_KEY, LOCAL_STORAGE_CSV_DATA, LOCAL_STORAGE_CSV_FILE_INFO } from '../constants';
import { useLogger } from './LogContext';

interface ApiContextType {
  apiKey: string | null;
  lookupKey: string | null;
  csvData: CsvData | null;
  csvFileInfo: CsvFileInfo | null;
  generateApiKey: () => void;
  generateLookupKey: () => void;
  setApiKey: (key: string) => void;
  setLookupKey: (key: string) => void;
  loadCsvData: (data: CsvData, fileName: string) => void;
  clearCsvData: () => void;
  uploadCsvToServer?: (data: CsvData) => Promise<{ status: number; data?: any; error?: string }>;
  fetchApiData: (filters?: Record<string, string>) => Promise<{ status: number; data: CsvData | Record<string, string> | { error: string }; }>;
  refreshApiKeys: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog } = useLogger();

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [lookupKey, setLookupKey] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CsvData | null>(() => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CSV_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  });
  const [csvFileInfo, setCsvFileInfo] = useState<CsvFileInfo | null>(() => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CSV_FILE_INFO);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  });

  // Fetch both API keys from backend
  const refreshApiKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/get-api-key');
      if (res.ok) {
        const { apiKey: k, lookupKey: l } = await res.json();
        setApiKey(k);
        setLookupKey(l);
        localStorage.setItem(LOCAL_STORAGE_API_KEY, k);
        localStorage.setItem('csv_lookup_key', l);
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshApiKeys();
  }, [refreshApiKeys]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY, apiKey);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_API_KEY);
    }
    if (lookupKey) {
      localStorage.setItem('csv_lookup_key', lookupKey);
    } else {
      localStorage.removeItem('csv_lookup_key');
    }
  }, [apiKey, lookupKey]);
  
  useEffect(() => {
    if (csvData) {
      localStorage.setItem(LOCAL_STORAGE_CSV_DATA, JSON.stringify(csvData));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CSV_DATA);
    }
  }, [csvData]);
  
  useEffect(() => {
    if (csvFileInfo) {
      localStorage.setItem(LOCAL_STORAGE_CSV_FILE_INFO, JSON.stringify(csvFileInfo));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CSV_FILE_INFO);
    }
  }, [csvFileInfo]);


  // Generate and set a new internal API key
  const generateApiKey = useCallback(async () => {
    const newKey = `csv-api-${crypto.randomUUID()}`;
    try {
      const res = await fetch('/api/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
        body: JSON.stringify({ newApiKey: newKey })
      });
      if (res.ok) {
        setApiKey(newKey);
        localStorage.setItem(LOCAL_STORAGE_API_KEY, newKey);
        addLog('API_KEY_GEN', 'Generated a new API key.');
      }
    } catch {}
  }, [apiKey, addLog]);

  // Generate and set a new lookup API key
  const generateLookupKey = useCallback(async () => {
    const newKey = `csv-api-lookup-${crypto.randomUUID()}`;
    try {
      const res = await fetch('/api/set-lookup-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
        body: JSON.stringify({ newLookupKey: newKey })
      });
      if (res.ok) {
        setLookupKey(newKey);
        localStorage.setItem('csv_lookup_key', newKey);
        addLog('API_KEY_GEN', 'Generated a new lookup API key.');
      }
    } catch {}
  }, [apiKey, addLog]);

  const loadCsvData = useCallback((data: CsvData, fileName: string) => {
    setCsvData(data);
    const newFileInfo: CsvFileInfo = { name: fileName, uploadedAt: new Date().toISOString() };
    setCsvFileInfo(newFileInfo);
    addLog('CSV_UPLOAD', `Uploaded file: ${fileName} (${data.length} rows)`);
    // Note: automatic server upload removed to avoid attempting uploads when
    // the backend intentionally disables upload endpoints (returns 403).
    // Use `uploadCsvToServer` below to explicitly send data to the server.
  }, [addLog, apiKey]);

  const uploadCsvToServer = useCallback(async (dataToSend: CsvData) => {
    if (!apiKey) {
      addLog('API_CALL_FAIL', 'No API key: cannot upload to server');
      return { status: 401, error: 'No API key configured' };
    }
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ data: dataToSend })
      });
      if (res.ok) {
        const json = await res.json();
        addLog('API_CALL_SUCCESS', `Uploaded ${json.saved || dataToSend.length} rows to server`);
        return { status: res.status, data: json };
      } else {
        const txt = await res.text();
        addLog('API_CALL_FAIL', `Server upload failed: ${res.status} ${txt}`);
        return { status: res.status, error: txt };
      }
    } catch (e) {
      addLog('API_CALL_FAIL', `Server upload error: ${String(e)}`);
      return { status: 500, error: String(e) };
    }
  }, [apiKey, addLog]);

  const clearCsvData = useCallback(() => {
    setCsvData(null);
    setCsvFileInfo(null);

    // If an API key is present, request the server to clear persisted data
    (async () => {
      try {
        if (!apiKey) return;
        const res = await fetch('/api/clear', {
          method: 'POST',
          headers: { 'x-api-key': apiKey }
        });
        if (res.ok) {
          addLog('API_CALL_SUCCESS', 'Cleared server persisted CSV data');
        } else {
          const txt = await res.text();
          addLog('API_CALL_FAIL', `Server clear failed: ${res.status} ${txt}`);
        }
      } catch (e) {
        addLog('API_CALL_FAIL', `Server clear error: ${String(e)}`);
      }
    })();
  }, [apiKey, addLog]);

  const fetchApiData = useCallback(async (filters?: Record<string, string>): Promise<{ status: number; data: any; }> => {
    if (!apiKey) {
      addLog('API_CALL_FAIL', 'Attempted to call API with no API key.');
      return { status: 401, data: { error: 'No API key configured. Please generate one.' } };
    }
    
    const query = filters ? Object.values(filters).join(' ') : '';
    addLog('API_CALL_START', `Searching for: "${query}"`);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ query, limit: 50 })
      });

      const resData = await res.json();

      if (res.ok) {
        addLog('API_CALL_SUCCESS', `API search for "${query}" returned ${resData.count} results.`);
        return { status: res.status, data: resData.results };
      } else {
        addLog('API_CALL_FAIL', `API search for "${query}" failed: ${res.status}`);
        return { status: res.status, data: resData };
      }
    } catch (e) {
      addLog('API_CALL_FAIL', `API search for "${query}" error: ${String(e)}`);
      return { status: 500, data: { error: 'A network error occurred.' } };
    }
  }, [apiKey, addLog]);

  const value = {
    apiKey,
    lookupKey,
    csvData,
    csvFileInfo,
    generateApiKey,
    generateLookupKey,
    setApiKey,
    setLookupKey,
    loadCsvData,
    clearCsvData,
    uploadCsvToServer,
    fetchApiData,
    refreshApiKeys
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

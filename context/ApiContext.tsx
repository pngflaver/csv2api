
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CsvData, CsvFileInfo } from '../types';
import { LOCAL_STORAGE_API_KEY, LOCAL_STORAGE_CSV_DATA, LOCAL_STORAGE_CSV_FILE_INFO } from '../constants';
import { useLogger } from './LogContext';

interface ApiContextType {
  apiKey: string | null;
  csvData: CsvData | null;
  csvFileInfo: CsvFileInfo | null;
  generateApiKey: () => void;
  loadCsvData: (data: CsvData, fileName: string) => void;
  clearCsvData: () => void;
  fetchApiData: (filters?: Record<string, string>) => { status: number; data: CsvData | Record<string, string> | { error: string }; };
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

  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem(LOCAL_STORAGE_API_KEY));
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

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY, apiKey);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_API_KEY);
    }
  }, [apiKey]);
  
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

  const generateApiKey = useCallback(() => {
    const newKey = `csv-api-${crypto.randomUUID()}`;
    setApiKey(newKey);
    addLog('API_KEY_GEN', 'Generated a new API key.');
  }, [addLog]);

  const loadCsvData = useCallback((data: CsvData, fileName: string) => {
    setCsvData(data);
    const newFileInfo: CsvFileInfo = { name: fileName, uploadedAt: new Date().toISOString() };
    setCsvFileInfo(newFileInfo);
    addLog('CSV_UPLOAD', `Uploaded file: ${fileName} (${data.length} rows)`);
  }, [addLog]);

  const clearCsvData = useCallback(() => {
    setCsvData(null);
    setCsvFileInfo(null);
  }, []);

  const fetchApiData = useCallback((filters?: Record<string, string>) => {
    if (!csvData || csvData.length === 0) {
      addLog('API_CALL_FAIL', 'Attempted to call API with no data loaded.');
      return { status: 404, data: { error: 'No data available. Please upload a CSV file.' } };
    }
    
    const activeFilters = filters ? Object.entries(filters).filter(([_, value]) => value && value.trim() !== '') : [];

    if (activeFilters.length === 0) {
        // No active filters, return random row
        const randomIndex = Math.floor(Math.random() * csvData.length);
        const randomRow = csvData[randomIndex];
        addLog('API_CALL_SUCCESS', `API call returned random row index: ${randomIndex}`);
        return { status: 200, data: randomRow };
    }

    const filterObject = Object.fromEntries(activeFilters);
    const filteredData = csvData.filter(row => {
        return Object.entries(filterObject).every(([key, value]) => {
            return row[key] && row[key].toLowerCase().includes(value.toLowerCase());
        });
    });

    if (filteredData.length > 0) {
        addLog('API_CALL_SUCCESS', `API search for ${JSON.stringify(filterObject)} returned ${filteredData.length} rows.`);
        return { status: 200, data: filteredData };
    } else {
        addLog('API_CALL_FAIL', `API search for ${JSON.stringify(filterObject)} returned no results.`);
        return { status: 404, data: { error: 'No records found matching your criteria.' } };
    }
  }, [csvData, addLog]);

  const value = { apiKey, csvData, csvFileInfo, generateApiKey, loadCsvData, clearCsvData, fetchApiData };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

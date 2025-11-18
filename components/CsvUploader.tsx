
import React, { useState, useCallback } from 'react';
import { useApi } from '../context/ApiContext';
import { CsvData } from '../types';

const CsvUploader: React.FC = () => {
  const { loadCsvData, csvData, csvFileInfo, clearCsvData } = useApi();
  const [error, setError] = useState<string | null>(null);

  const parseCsv = (csvText: string): CsvData | null => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setError('CSV must have a header row and at least one data row.');
      return null;
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      // This regex handles commas inside quoted fields
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim() : '';
        // Remove quotes from quoted fields
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        row[header] = value;
      });
      return row;
    });
    return data;
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const parsedData = parseCsv(text);
          if (parsedData) {
            loadCsvData(parsedData, file.name);
          }
        } else {
          setError('Could not read file content.');
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset file input
  }, [loadCsvData]);

  const handleClearData = () => {
    clearCsvData();
    setError(null);
  }

  return (
    <div className="space-y-4">
      {csvData && csvFileInfo ? (
        <div className="text-center p-4 border-2 border-dashed border-green-400 dark:border-green-600 rounded-lg">
          <p className="font-semibold text-green-600 dark:text-green-400">
            {csvData.length} rows loaded successfully!
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            <p>File: <span className="font-medium">{csvFileInfo.name}</span></p>
            <p>Uploaded: <span className="font-medium">{new Date(csvFileInfo.uploadedAt).toLocaleString()}</span></p>
          </div>
           <button onClick={handleClearData} className="mt-4 w-full text-sm bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                Clear Data & Upload New
            </button>
        </div>
      ) : (
        <>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload a CSV file to simulate the API. The file should have a header row.</p>
            <div className="mt-1">
                <label htmlFor="file-upload" className="w-full cursor-pointer bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 text-center block">
                    <span>Upload CSV File</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                </label>
            </div>
        </>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CsvUploader;

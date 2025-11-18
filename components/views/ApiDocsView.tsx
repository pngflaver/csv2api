
import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

const ApiDocsView: React.FC = () => {
  const { apiKey, generateApiKey, fetchApiData, csvData } = useApi();
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [filter1Value, setFilter1Value] = useState('');
  const [filter2Value, setFilter2Value] = useState('');

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const hasData = csvData && csvData.length > 0;
  const headers = hasData ? Object.keys(csvData[0]) : [];
  const firstColumnHeader = headers.length > 0 ? headers[0] : null;
  const secondColumnHeader = headers.length > 1 ? headers[1] : null;

  const handleTestApi = () => {
    const filters: Record<string, string> = {};
    if (firstColumnHeader && filter1Value) {
      filters[firstColumnHeader] = filter1Value;
    }
    if (secondColumnHeader && filter2Value) {
      filters[secondColumnHeader] = filter2Value;
    }
    const { status, data } = fetchApiData(filters);
    setApiStatus(status);
    setApiResponse(JSON.stringify(data, null, 2));
  };
  
  const curlExample = `curl -X GET "https://api.example.com/api/data/search?${firstColumnHeader || 'column_name'}=some_value" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}"`;


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
        {apiKey ? (
          <div className="space-y-4">
            <p>Your API Key:</p>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <code className="text-sm text-gray-800 dark:text-gray-200 truncate">{apiKey}</code>
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                {copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5" />}
              </button>
            </div>
            <button
              onClick={generateApiKey}
              className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600"
            >
              Regenerate Key
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">You have not generated an API key yet.</p>
            <button
              onClick={generateApiKey}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            >
              Generate API Key
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
        <div className="space-y-4">
          <p>This is a simulated API. To retrieve data from your uploaded CSV file, make a GET request to one of the following endpoints.</p>
          
          <h3 className="font-semibold pt-2">Get Random Record</h3>
          <p className="text-sm">Returns a single, random row from your data.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">GET /api/data/random</code>
          </div>

          <h3 className="font-semibold pt-2">Search Records</h3>
          <p className="text-sm">Search for records by providing column names and values as query parameters. The search is case-insensitive and matches if the value is contained within the cell data. Returns an array of matching rows.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">GET /api/data/search?{firstColumnHeader || 'column_name'}=value</code>
          </div>

          <h3 className="font-semibold pt-2">Headers</h3>
          <p>You must include your API key in the `Authorization` header for all requests.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
          </div>
          
          <h3 className="font-semibold pt-4">Example cURL Request</h3>
          <p className="text-sm">Here's an example of how you could query the API from your terminal. (Note: The URL is a placeholder for a real server.)</p>
          <div className="bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto mt-2">
            <pre><code>{curlExample}</code></pre>
          </div>

          <h3 className="font-semibold pt-2">Response Codes</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">200 OK</code>: Success. The body will contain a JSON object or an array of objects.</li>
            <li><code className="bg-red-100 dark:bg-red-900 px-1 rounded">401 Unauthorized</code>: Failure. API key is missing or invalid (simulated).</li>
            <li><code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">404 Not Found</code>: Failure. No CSV data has been uploaded, or no records match the search criteria.</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">API Tester</h2>
        
        {hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {firstColumnHeader && (
                <div>
                    <label htmlFor="filter1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{firstColumnHeader}</label>
                    <input 
                      type="text" 
                      id="filter1" 
                      value={filter1Value} 
                      onChange={e => setFilter1Value(e.target.value)}
                      placeholder={`Filter by ${firstColumnHeader}...`}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
            )}
            {secondColumnHeader && (
                <div>
                    <label htmlFor="filter2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{secondColumnHeader}</label>
                    <input 
                      type="text" 
                      id="filter2" 
                      value={filter2Value} 
                      onChange={e => setFilter2Value(e.target.value)}
                      placeholder={`Filter by ${secondColumnHeader}...`}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
            )}
             <p className="text-xs text-gray-500 dark:text-gray-400 md:col-span-2">Leave fields blank to get a single random record.</p>
          </div>
        ) : (
          <p className="text-yellow-500 text-sm mb-4">Please upload a CSV file to test the API.</p>
        )}
        
        <button
          onClick={handleTestApi}
          disabled={!hasData || !apiKey}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Endpoint
        </button>
        {!apiKey && <p className="text-yellow-500 text-sm mt-2">Please generate an API key to test the API.</p>}
        {apiResponse && (
          <div className="mt-4">
            <h3 className="font-semibold">Response: 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${apiStatus === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Status: {apiStatus}
              </span>
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mt-2 text-sm overflow-x-auto">
              <code>{apiResponse}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocsView;

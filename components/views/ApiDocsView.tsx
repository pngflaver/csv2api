import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

const ApiDocsView: React.FC = () => {
  const { apiKey, lookupKey, generateApiKey, generateLookupKey, fetchApiData, csvData, refreshApiKeys } = useApi();
  const [copied, setCopied] = useState(false);
  const [copiedLookup, setCopiedLookup] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter1Value, setFilter1Value] = useState('');
  const [filter2Value, setFilter2Value] = useState('');

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handleCopyLookup = () => {
    if (lookupKey) {
      navigator.clipboard.writeText(lookupKey);
      setCopiedLookup(true);
      setTimeout(() => setCopiedLookup(false), 2000);
    }
  };
  
  const hasData = csvData && csvData.length > 0;
  const headers = hasData ? Object.keys(csvData[0]) : [];
  const firstColumnHeader = headers.length > 0 ? headers[0] : null;
  const secondColumnHeader = headers.length > 1 ? headers[1] : null;

  const handleTestApi = async () => {
    const filters: Record<string, string> = {};
    if (firstColumnHeader && filter1Value) {
      filters[firstColumnHeader] = filter1Value;
    }
    if (secondColumnHeader && filter2Value) {
      filters[secondColumnHeader] = filter2Value;
    }
    
    setIsLoading(true);
    setApiResponse(null);
    setApiStatus(null);

    const { status, data } = await fetchApiData(filters);
    
    setApiStatus(status);
    setApiResponse(JSON.stringify(data, null, 2));
    setIsLoading(false);
  };
  
  const curlExample = `curl -X GET "https://api.example.com/api/data/search?${firstColumnHeader || 'column_name'}=some_value" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}"`;


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
        <div className="space-y-6">
          <div>
            <p className="font-semibold mb-1">Internal API Key (for admin/maintenance endpoints):</p>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <code className="text-sm text-gray-800 dark:text-gray-200 truncate">{apiKey || <span className="italic">Loading...</span>}</code>
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                {copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={async () => { await generateApiKey(); await refreshApiKeys(); }}
                className="px-2 py-1 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 text-xs"
              >
                Regenerate
              </button>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">Lookup API Key (for /api/lookup endpoint):</p>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <code className="text-sm text-gray-800 dark:text-gray-200 truncate">{lookupKey || <span className="italic">Loading...</span>}</code>
              <button onClick={handleCopyLookup} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                {copiedLookup ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={async () => { await generateLookupKey(); await refreshApiKeys(); }}
                className="px-2 py-1 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 text-xs"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
        <div className="space-y-4">
          <p>Below are the main API endpoints for interacting with your uploaded CSV data. <b>All endpoints require your API key in the <code>Authorization</code> header.</b></p>

          <h3 className="font-semibold pt-2">Upload CSV Data</h3>
          <p className="text-sm">Upload your CSV data to the server. The body should be a JSON object with a <code>data</code> property containing an array of rows.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">POST /api/upload</code>
          </div>
          <pre className="bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto mt-2">
{`curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":[{"email":"test@example.com","firstName":"John"}]}'`}
          </pre>
          <h3 className="font-semibold pt-2">Upload CSV Data</h3>
          <p className="text-sm">Upload your CSV data to the server. The body should be a JSON object with a <code>data</code> property containing an array of rows. <b>Requires Internal API Key.</b></p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">POST /api/upload</code>
          </div>
          <pre className="bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto mt-2">
{`curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \
  -H "Content-Type: application/json" \
  -d '{"data":[{"email":"test@example.com","firstName":"John"}]}'`}
          </pre>

          <h3 className="font-semibold pt-2">Lookup Record (requires two values)</h3>
          <p className="text-sm">Find a record by providing <b>both</b> <code>email</code> and <code>firstName</code> in the JSON body. Both fields are required.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">POST /api/lookup</code>
          </div>
          <pre className="bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto mt-2">
{`curl -X POST http://localhost:3001/api/lookup \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"John"}'`}
          </pre>

          <h3 className="font-semibold pt-2">Clear All Data</h3>
          <p className="text-sm">Remove all uploaded CSV data from the server.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">POST /api/clear</code>
          </div>
          <pre className="bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto mt-2">
{`curl -X POST http://localhost:3001/api/clear \
  -H "Authorization: Bearer YOUR_API_KEY"`}
          </pre>

          <h3 className="font-semibold pt-2">Get Current API Key</h3>
          <p className="text-sm">Retrieve the current API key (for debugging or automation).</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">GET /api/get-api-key</code>
          </div>

          <h3 className="font-semibold pt-2">Set/Update API Key</h3>
          <p className="text-sm">Update the API key (requires current valid API key in the header).</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <code className="text-sm">POST /api/set-api-key</code>
          </div>
          <pre className="bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto mt-2">
{`curl -X POST http://localhost:3001/api/set-api-key \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"newApiKey":"NEW_API_KEY_VALUE"}'`}
          </pre>
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
          disabled={!hasData || !apiKey || isLoading}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test Endpoint'}
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

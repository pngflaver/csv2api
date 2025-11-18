import React from 'react';
import { useLogger } from '../../context/LogContext';
import { LogEntry, LogAction } from '../../types';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const getActionStyle = (action: LogAction) => {
  switch (action) {
    case 'LOGIN':
    case 'API_CALL_SUCCESS':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'LOGOUT':
    case 'API_KEY_GEN':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'CSV_UPLOAD':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'API_CALL_FAIL':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const AuditLogView: React.FC = () => {
  const { logs } = useLogger();

  const handleExport = () => {
    if (logs.length === 0) return;

    const header = "Timestamp, User, Action, Details\n";
    const logContent = logs
      .map(log => `"${new Date(log.timestamp).toLocaleString()}", "${log.user}", "${log.action}", "${log.details}"`)
      .join("\n");
    
    const fullLog = header + logContent;
    
    const blob = new Blob([fullLog], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logs.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <button
          onClick={handleExport}
          disabled={logs.length === 0}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export Logs
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">Timestamp</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{log.user}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center py-4 text-gray-500">No logs found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;

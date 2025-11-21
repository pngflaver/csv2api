import React from 'react';
import { useApi } from '../../context/ApiContext';
import { useLogger } from '../../context/LogContext';
import CsvUploader from '../CsvUploader';
import UsageChart from '../UsageChart';
import ApiLogTable from '../ApiLogTable';
import { ArrowDownTrayIcon, KeyIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
    <div className="bg-indigo-500 text-white rounded-full p-3 mr-4">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const DashboardView: React.FC = () => {
  const { csvData, apiKey, csvFileInfo, serverStatus } = useApi() as any;
  const { logs } = useLogger();

  const apiCalls = logs.filter(log => log.action.startsWith('API_CALL')).length;
  const dataRows = serverStatus && serverStatus.hasData ? (serverStatus.metadata && serverStatus.metadata.rows ? serverStatus.metadata.rows : (csvData ? csvData.length : 0)) : (csvData ? csvData.length : 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="CSV Data Rows" value={dataRows} icon={ArrowDownTrayIcon} />
        <StatCard title="Total API Calls" value={apiCalls} icon={CodeBracketIcon} />
        <StatCard title="API Key Status" value={apiKey ? 'Generated' : 'Not Set'} icon={KeyIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">API Usage Over Time</h2>
          <div style={{ height: '300px' }}>
            <UsageChart />
          </div>
          {/* API Log Table below the usage graph */}
          <ApiLogTable />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>Server data table: <span className="font-medium">{serverStatus && serverStatus.hasData ? 'Populated' : 'Empty'}</span></p>
            {serverStatus && serverStatus.metadata && (
              <>
                <p>File: <span className="font-medium">{serverStatus.metadata.fileName}</span></p>
                <p>Uploaded: <span className="font-medium">{new Date(serverStatus.metadata.uploadedAt).toLocaleString()}</span></p>
              </>
            )}
          </div>
          <CsvUploader />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

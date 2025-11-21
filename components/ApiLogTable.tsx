import React, { useEffect, useState } from 'react';

const columns = [
  { key: 'time', label: 'Time' },
  { key: 'method', label: 'Method' },
  { key: 'path', label: 'Path' },
  { key: 'status', label: 'Status' },
  { key: 'duration', label: 'Duration (ms)' },
  { key: 'ip', label: 'IP' },
  { key: 'agent', label: 'Agent' },
  { key: 'token', label: 'Token' },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800',
  POST: 'bg-green-100 text-green-800',
};
const statusColors = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
  if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
  if (status >= 500) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function ApiLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let mounted = true;
    const fetchLogs = async () => {
      const res = await fetch('/api/logs?limit=100');
      const data = await res.json();
      if (mounted) setLogs(data);
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const filtered = logs.filter(
    l =>
      columns.some(col =>
        String(l[col.key] ?? '')
          .toLowerCase()
          .includes(filter.toLowerCase())
      )
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'status' || sortKey === 'duration') {
      return sortDir === 'asc'
        ? (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
        : (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
    }
    if (sortKey === 'time') {
      return sortDir === 'asc'
        ? new Date(a.time).getTime() - new Date(b.time).getTime()
        : new Date(b.time).getTime() - new Date(a.time).getTime();
    }
    return sortDir === 'asc'
      ? String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''))
      : String(b[sortKey] ?? '').localeCompare(String(a[sortKey] ?? ''));
  });

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
        <h3 className="text-lg font-bold">API Call Logs</h3>
        <input
          className="border rounded px-2 py-1 text-sm w-full sm:w-64"
          placeholder="Filter logs..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded overflow-hidden">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-pointer select-none"
                  onClick={() => {
                    if (sortKey === col.key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    else { setSortKey(col.key); setSortDir('desc'); }
                  }}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                <td className="px-3 py-1 whitespace-nowrap">{formatTime(log.time)}</td>
                <td className="px-3 py-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${methodColors[log.method] || 'bg-gray-100 text-gray-800'}`}>{log.method}</span>
                </td>
                <td className="px-3 py-1 font-mono">{log.path}</td>
                <td className="px-3 py-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors(log.status)}`}>{log.status}</span>
                </td>
                <td className="px-3 py-1 text-right">{log.duration}</td>
                <td className="px-3 py-1 font-mono">{log.ip}</td>
                <td className="px-3 py-1 truncate max-w-xs" title={log.agent}>{log.agent}</td>
                <td className="px-3 py-1 font-mono">{log.token}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-gray-400">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

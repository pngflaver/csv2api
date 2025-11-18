
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLogger } from '../context/LogContext';

const UsageChart: React.FC = () => {
  const { logs } = useLogger();

  const processData = () => {
    const apiCalls = logs.filter(log => log.action === 'API_CALL_SUCCESS');
    const callsByDay: { [key: string]: number } = {};

    apiCalls.forEach(call => {
      const date = new Date(call.timestamp).toISOString().split('T')[0];
      if (callsByDay[date]) {
        callsByDay[date]++;
      } else {
        callsByDay[date] = 1;
      }
    });

    return Object.keys(callsByDay)
      .map(date => ({
        date,
        calls: callsByDay[date],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const data = processData();

  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No API usage data to display. Make some API calls to see the chart.</p>
        </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
        <XAxis dataKey="date" tick={{ fill: 'rgb(156 163 175)' }} />
        <YAxis allowDecimals={false} tick={{ fill: 'rgb(156 163 175)' }} />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
                color: '#F9FAFB'
            }}
            cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
        />
        <Legend />
        <Bar dataKey="calls" fill="#4f46e5" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UsageChart;

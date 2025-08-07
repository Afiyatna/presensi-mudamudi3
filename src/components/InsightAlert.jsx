import React from 'react';

const InsightAlert = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="mb-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/60 rounded-xl p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-600 dark:text-red-300 text-xl">⚠️</span>
          <span className="text-base font-semibold text-red-800 dark:text-red-200">Perhatian: Anomali Data</span>
        </div>
        <ul className="list-disc ml-7 text-red-700 dark:text-red-200 text-sm">
          {alerts.map((alert, idx) => (
            <li key={idx}>{alert}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightAlert; 
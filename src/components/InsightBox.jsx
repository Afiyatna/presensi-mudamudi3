import React from 'react';

const InsightBox = ({ insights }) => {
  if (!insights || insights.length === 0) return null;
  return (
    <div className="mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
      <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 dark:from-blue-900/30 dark:via-emerald-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700/40 rounded-xl p-6 shadow-sm flex flex-col gap-3">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">Insight Otomatis</h2>
        <ul className="space-y-2">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 text-blue-500 dark:text-blue-300">{insight.icon}</span>
              <span className="text-gray-700 dark:text-gray-100 text-sm">{insight.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightBox; 
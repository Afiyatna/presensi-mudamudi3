import React from 'react';

const StatisticsCards = ({ stats }) => {
  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    );
    if (trend < 0) return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
      </svg>
    );
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 animate-fadeIn"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white relative">
                {stat.value}
                {stat.trend !== undefined && stat.trend !== 0 && (
                  <span className={`absolute -top-2 -right-8 flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm ${stat.trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                    {stat.trend > 0 ? (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l5-5 5 5" /></svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l-5 5-5-5" /></svg>
                    )}
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                  </span>
                )}
              </p>
              {stat.trend !== undefined && (
                <div className={`flex items-center mt-2 text-sm font-medium ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  <span className="ml-1">
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                  </span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    dari periode sebelumnya
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${stat.iconBg || 'bg-blue-100 dark:bg-blue-900/30'}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards; 
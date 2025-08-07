import React from 'react';

const SkeletonDashboard = () => (
  <div className="animate-pulse">
    {/* Skeleton Statistics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-28 p-6 flex flex-col justify-between border border-gray-200 dark:border-gray-700">
          <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-8 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
    {/* Skeleton Chart Blocks */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-80 border border-gray-200 dark:border-gray-700"></div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-80 border border-gray-200 dark:border-gray-700"></div>
      </div>
    </div>
    {/* Skeleton Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-64 border border-gray-200 dark:border-gray-700"></div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-64 border border-gray-200 dark:border-gray-700"></div>
      </div>
    </div>
  </div>
);

export default SkeletonDashboard; 
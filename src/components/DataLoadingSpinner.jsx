import React from 'react';

const DataLoadingSpinner = ({ message = "Memuat data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="mt-4 text-gray-600 text-sm">{message}</div>
    </div>
  );
};

export default DataLoadingSpinner; 
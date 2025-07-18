import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Main spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        
        {/* Loading text with animation */}
        <div className="flex space-x-1">
          <span className="text-gray-600 font-medium text-lg">Loading</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        {/* Subtitle */}
        <div className="text-gray-500 text-sm">
          Mohon tunggu sebentar...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 
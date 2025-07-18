import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { usePageLoading } from '../hooks/usePageLoading';

const PageTransition = ({ children }) => {
  const isLoading = usePageLoading();

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div 
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default PageTransition; 
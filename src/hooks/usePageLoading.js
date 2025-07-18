import { useState, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const usePageLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState('');
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only show loading if it's a different path and not a POP navigation (back/forward)
    if (location.pathname !== previousPath && navigationType !== 'POP') {
      setIsLoading(true);
      
      // Simulate loading time for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
    
    setPreviousPath(location.pathname);
  }, [location.pathname, previousPath, navigationType]);

  return isLoading;
}; 
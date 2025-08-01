import React, { useState, useEffect } from 'react';

const RealtimeStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Simulasi status koneksi real-time
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
      if (navigator.onLine) {
        setLastUpdate(new Date());
      }
    };

    // Check initial connection
    checkConnection();

    // Listen for online/offline events
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    // Update status every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(interval);
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-40">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          <span>Koneksi terputus</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-sm shadow-lg z-40">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        <span>Sistem notifikasi aktif</span>
      </div>
    </div>
  );
};

export default RealtimeStatus; 
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const RealtimeTest = ({ namaLengkap }) => {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!namaLengkap) return;

    console.log('RealtimeTest: Setting up test subscriptions for', namaLengkap);

    const presensiDaerahSubscription = supabase
      .channel('test_presensi_daerah')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'presensi_daerah'
        },
        (payload) => {
          console.log('RealtimeTest: Daerah event received:', payload);
          setEvents(prev => [...prev, { 
            type: 'daerah', 
            data: payload.new, 
            timestamp: new Date().toLocaleTimeString(),
            isMatch: payload.new.nama_lengkap === namaLengkap
          }]);
        }
      )
      .subscribe((status) => {
        console.log('RealtimeTest: Daerah subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    const presensiDesaSubscription = supabase
      .channel('test_presensi_desa')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'presensi_desa'
        },
        (payload) => {
          console.log('RealtimeTest: Desa event received:', payload);
          setEvents(prev => [...prev, { 
            type: 'desa', 
            data: payload.new, 
            timestamp: new Date().toLocaleTimeString(),
            isMatch: payload.new.nama_lengkap === namaLengkap
          }]);
        }
      )
      .subscribe((status) => {
        console.log('RealtimeTest: Desa subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      presensiDaerahSubscription.unsubscribe();
      presensiDesaSubscription.unsubscribe();
    };
  }, [namaLengkap]);

  const clearEvents = () => {
    setEvents([]);
  };

  if (!namaLengkap) return null;

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Real-time Test ({namaLengkap})
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="max-h-40 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Menunggu events...
          </p>
        ) : (
          events.map((event, index) => (
            <div 
              key={index} 
              className={`text-xs p-2 mb-1 rounded ${
                event.isMatch 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="font-medium">
                {event.type.toUpperCase()} - {event.timestamp}
              </div>
              <div className="text-xs opacity-75">
                {event.data.nama_lengkap} - {event.data.status}
              </div>
              {event.isMatch && (
                <div className="text-xs font-bold text-green-600 dark:text-green-400">
                  ✓ MATCH!
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <button 
        onClick={clearEvents}
        className="mt-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        Clear Events
      </button>
    </div>
  );
};

export default RealtimeTest; 
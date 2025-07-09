import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function BottomNavigation({ role }) {
  const location = useLocation();
  const { pathname } = location;

  const adminItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard', activePaths: ['/dashboard'] },
    { path: '/qr-scanner', icon: '📷', label: 'QR Scanner', activePaths: ['/qr-scanner', '/qr-scanner-daerah', '/qr-scanner-desa'] },
    { path: '/attendance-report-menu', icon: '📊', label: 'Rekap Presensi', activePaths: ['/attendance-report-menu', '/attendance-report', '/attendance-report-daerah', '/attendance-report-desa', '/attendance-report-dummy'] },
    { path: '/data-profile-user', icon: '👥', label: 'Data Profile User', activePaths: ['/data-profile-user'] },
  ];
  const userItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard', activePaths: ['/dashboard'] },
    { path: '/user-qr', icon: '📱', label: 'QR Code', activePaths: ['/user-qr'] },
    { path: '/user-history', icon: '📊', label: 'Riwayat', activePaths: ['/user-history'] },
    { path: '/profile', icon: '👤', label: 'Profile', activePaths: ['/profile'] },
  ];
  const items = role === 'admin' ? adminItems : userItems;
  const isActive = (activePaths) => activePaths.some(path => pathname === path);
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              isActive(item.activePaths)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(50);
            }}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation; 
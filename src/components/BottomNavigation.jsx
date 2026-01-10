import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function BottomNavigation({ role }) {
  const location = useLocation();
  const { pathname } = location;

  const adminItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard', activePaths: ['/dashboard'] },
    { path: '/qr-scanner', icon: '📷', label: 'QR Scanner', activePaths: ['/qr-scanner', '/qr-scanner/kegiatan'] },
    { path: '/riwayat-presensi', icon: '📊', label: 'Riwayat Presensi', activePaths: ['/riwayat-presensi'] },
    { path: '/data-profile-user', icon: '👥', label: 'Profile User', activePaths: ['/data-profile-user'] },
    { path: '/batch-create-user', icon: '📝', label: 'Batch Create', activePaths: ['/batch-create-user'] },
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700/60 lg:hidden z-50 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 py-1 ${isActive(item.activePaths)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(50);
            }}
          >
            <span className="text-[22px] leading-none mb-1">{item.icon}</span>
            <span className="text-[11px] leading-tight text-center font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation; 
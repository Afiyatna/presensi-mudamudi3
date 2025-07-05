import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import LayoutDashboard from '../layouts/LayoutDashboard';

export default function QrScannerMenu() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <LayoutDashboard pageTitle="QR Scanner Menu">
      <div className="flex flex-col gap-6 items-center justify-center min-h-[60vh] py-8">
        <button
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-3 shadow transition-all"
          onClick={() => navigate('/qr-scanner/daerah')}
        >
          <span role="img" aria-label="daerah">📍</span> QR Scanner Presensi Daerah
        </button>
        <button
          className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-3 shadow transition-all"
          onClick={() => navigate('/qr-scanner/desa')}
        >
          <span role="img" aria-label="desa">🏡</span> QR Scanner Presensi Desa
        </button>
      </div>
    </LayoutDashboard>
  );
} 
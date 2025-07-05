import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

export default function AttendanceReportMenu() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-8 w-full">
            <button
              onClick={() => navigate('/attendance-report-daerah')}
              className="relative px-10 py-6 bg-blue-600 text-white rounded-2xl shadow-xl text-2xl font-bold mb-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 group"
            >
              <span className="inline-block mr-3 animate-pulse group-hover:animate-none">📍</span>
              Rekap Presensi Daerah
              <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
            <button
              onClick={() => navigate('/attendance-report-desa')}
              className="relative px-10 py-6 bg-green-600 text-white rounded-2xl shadow-xl text-2xl font-bold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 group"
            >
              <span className="inline-block mr-3 animate-pulse group-hover:animate-none">🏡</span>
              Rekap Presensi Desa
              <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
} 
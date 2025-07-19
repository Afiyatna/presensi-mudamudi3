import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import LayoutDashboard from '../layouts/LayoutDashboard';

export default function AttendanceReportMenu() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);  

  return (
    <LayoutDashboard pageTitle="Riwayat Presensi">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Deskripsi halaman */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Menu Rekap Presensi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-justify">
            Pilih jenis rekap presensi yang ingin Anda lihat. Setiap jenis kegiatan memiliki data presensi terpisah 
            yang dapat difilter dan diekspor dalam berbagai format (Excel, PDF, JPG).
          </p>
        </div>
        
        <div className="flex flex-col gap-6 items-center justify-center min-h-[60vh] py-8">
          <div className="w-full max-w-xs">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-3 shadow transition-all"
              onClick={() => navigate('/attendance-report-daerah')}
            >
              <span role="img" aria-label="daerah">📍</span> Rekap Presensi Daerah
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Data presensi kegiatan pengajian tingkat daerah
            </p>
          </div>
          
          <div className="w-full max-w-xs">
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-3 shadow transition-all"
              onClick={() => navigate('/attendance-report-desa')}
            >
              <span role="img" aria-label="desa">🏡</span> Rekap Presensi Desa
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Data presensi kegiatan pengajian tingkat desa
            </p>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
} 
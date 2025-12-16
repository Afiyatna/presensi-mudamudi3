import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
// import QRScanner from './pages/QRScanner';
import QrScannerUniversal from './pages/QrScannerUniversal';
import UserQRCode from './pages/UserQRCode';
import UserPresensiHistory from './pages/UserPresensiHistory';
import RequireAuth from './components/RequireAuth';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AttendanceReportMenu from './pages/AttendanceReportMenu';
import AttendanceReportDaerah from './pages/AttendanceReportDaerah';
import AttendanceReportDesa from './pages/AttendanceReportDesa';
import { RequireAdmin } from './components/RequireAuth';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';
import DataProfileUser from './pages/DataProfileUser';
import PageTransition from './components/PageTransition';
import KegiatanAdmin from './pages/KegiatanAdmin';
import KegiatanUser from './pages/KegiatanUser';
import KelolaIzinAdmin from './pages/KelolaIzinAdmin';
import RiwayatPresensiTerintegrasi from './pages/RiwayatPresensiTerintegrasi';
import NotifikasiAdmin from './pages/NotifikasiAdmin';
import AnalyticsAdmin from './pages/AnalyticsAdmin';

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/kegiatan" element={<RequireAuth><RequireAdmin><KegiatanAdmin /></RequireAdmin></RequireAuth>} />
        <Route path="/user-kegiatan" element={<RequireAuth><KegiatanUser /></RequireAuth>} />
        <Route path="/kelola-izin" element={<RequireAuth><RequireAdmin><KelolaIzinAdmin /></RequireAdmin></RequireAuth>} />
        <Route path="/riwayat-presensi" element={<RequireAuth><RequireAdmin><RiwayatPresensiTerintegrasi /></RequireAdmin></RequireAuth>} />
        <Route path="/notifikasi" element={<RequireAuth><RequireAdmin><NotifikasiAdmin /></RequireAdmin></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><RequireAdmin><AnalyticsAdmin /></RequireAdmin></RequireAuth>} />
        <Route path="/qr-scanner" element={<RequireAuth><RequireAdmin><QrScannerUniversal /></RequireAdmin></RequireAuth>} />
        <Route path="/qr-scanner/kegiatan" element={<RequireAuth><RequireAdmin><QrScannerUniversal /></RequireAdmin></RequireAuth>} />
        <Route path="/attendance-report-menu" element={<RequireAuth><RequireAdmin><AttendanceReportMenu /></RequireAdmin></RequireAuth>} />
        <Route path="/attendance-report-daerah" element={<RequireAuth><RequireAdmin><AttendanceReportDaerah /></RequireAdmin></RequireAuth>} />
        <Route path="/attendance-report-desa" element={<RequireAuth><RequireAdmin><AttendanceReportDesa /></RequireAdmin></RequireAuth>} />
        <Route path="/user-qr" element={<RequireAuth><UserQRCode /></RequireAuth>} />
        <Route path="/user-history" element={<RequireAuth><UserPresensiHistory /></RequireAuth>} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/data-profile-user" element={<RequireAuth><RequireAdmin><DataProfileUser /></RequireAdmin></RequireAuth>} />
      </Routes>
    </PageTransition>
  );
}

export default App;

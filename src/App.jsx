import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
// import QRScanner from './pages/QRScanner';
import QrScannerMenu from './pages/QrScannerMenu';
import QrScannerDaerah from './pages/QrScannerDaerah';
import QrScannerDesa from './pages/QrScannerDesa';
import AttendanceReport from './pages/AttendanceReport';
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

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/qr-scanner" element={<RequireAuth><RequireAdmin><QrScannerMenu /></RequireAdmin></RequireAuth>} />
        <Route path="/qr-scanner/daerah" element={<RequireAuth><RequireAdmin><QrScannerDaerah /></RequireAdmin></RequireAuth>} />
        <Route path="/qr-scanner/desa" element={<RequireAuth><RequireAdmin><QrScannerDesa /></RequireAdmin></RequireAuth>} />
        <Route path="/attendance-report" element={<RequireAuth><RequireAdmin><AttendanceReport /></RequireAdmin></RequireAuth>} />
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
    </>
  );
}

export default App;

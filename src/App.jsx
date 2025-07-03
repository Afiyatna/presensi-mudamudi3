import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import QRScanner from './pages/QRScanner';
import AttendanceReport from './pages/AttendanceReport';
import UserQRCode from './pages/UserQRCode';
import UserPresensiHistory from './pages/UserPresensiHistory';
import RequireAuth from './components/RequireAuth';
import Register from './pages/Register';
import Profile from './pages/Profile';

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
        <Route path="/qr-scanner" element={<QRScanner />} />
        <Route path="/attendance-report" element={<AttendanceReport />} />
        <Route path="/user-qr" element={<RequireAuth><UserQRCode /></RequireAuth>} />
        <Route path="/user-history" element={<RequireAuth><UserPresensiHistory /></RequireAuth>} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </>
  );
}

export default App;

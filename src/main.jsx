import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ThemeProvider from './utils/ThemeContext';
import App from './App';
import DashboardDummy from './pages/DashboardDummy';
import AttendanceReportDummy from './pages/AttendanceReportDummy';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/dashboard-dummy" element={<DashboardDummy />} />
          <Route path="/rekap-presensi-dummy" element={<AttendanceReportDummy />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);

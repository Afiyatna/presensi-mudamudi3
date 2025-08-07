import React, { useEffect, useState } from 'react';
import FilterButton from '../components/DropdownFilter';
import Datepicker from '../components/Datepicker';
import DashboardCard01 from '../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../partials/dashboard/DashboardCard06';
import DashboardCard07 from '../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../partials/dashboard/DashboardCard09';
import DashboardCard10 from '../partials/dashboard/DashboardCard10';
import DashboardCard11 from '../partials/dashboard/DashboardCard11';
import DashboardCard12 from '../partials/dashboard/DashboardCard12';
import DashboardCard13 from '../partials/dashboard/DashboardCard13';
import Banner from '../partials/Banner';
import BarChart01 from '../charts/BarChart01';
import LineChart01 from '../charts/LineChart01';
import LineChartTrend from '../charts/LineChartTrend';
import DoughnutChart from '../charts/DoughnutChart';
import StatisticsCards from '../components/StatisticsCards';
import RecentActivity from '../components/RecentActivity';
import { supabase } from '../supabaseClient';
import { useThemeProvider } from '../utils/ThemeContext';
import DropdownFilter from '../components/DropdownFilter';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DateRangePicker from '../components/DateRangePicker';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import AreaChartMonthly from '../charts/AreaChartMonthly';
import MixedChartPresensiType from '../charts/MixedChartPresensiType';
import HorizontalBarDesa from '../charts/HorizontalBarDesa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import InsightBox from '../components/InsightBox';
import InsightAlert from '../components/InsightAlert';
import SkeletonDashboard from '../components/SkeletonDashboard';

function Dashboard() {
  // State untuk role dan data presensi user
  const [role, setRole] = useState(null);
  const [userPresensi, setUserPresensi] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [allPresensi, setAllPresensi] = useState([]); // untuk admin
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentTheme } = useThemeProvider();
  // Filter state untuk user
  const [userChartType, setUserChartType] = useState('bar');
  const [userStatus, setUserStatus] = useState('');
  const [userDateRange, setUserDateRange] = useState({ from: '', to: '' });
  // Tambahan untuk filter panel baru
  const [filterDropdown, setFilterDropdown] = useState({ jenis: [], status: [] });
  // State untuk filter admin
  const [adminFilterDropdown, setAdminFilterDropdown] = useState({ kelompok: [], desa: [], jenis_kelamin: [], status: [] });
  const [adminDateRange, setAdminDateRange] = useState({ from: '', to: '' });
  const [adminJenisPresensi, setAdminJenisPresensi] = useState('Presensi Daerah'); // Default: Daerah saja
  const [profiles, setProfiles] = useState([]); // Untuk statistics cards
  const [dashboardStats, setDashboardStats] = useState([]); // Statistics cards data
  const [attendanceTrendData, setAttendanceTrendData] = useState({ labels: [], datasets: [] }); // Trend chart data
  const [statusDistributionData, setStatusDistributionData] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [] }] }); // Doughnut chart data
  const [recentActivities, setRecentActivities] = useState([]); // Recent activities data
  // State for area chart data
  const [monthlyVolumeData, setMonthlyVolumeData] = useState({ labels: [], values: [] });
  const [mixedPresensiTypeData, setMixedPresensiTypeData] = useState({ labels: [], daerah: [], desa: [] });
  const [desaRankingData, setDesaRankingData] = useState({ labels: [], values: [] });
  // Tambahkan state untuk pencarian nama
  const [adminSearchNama, setAdminSearchNama] = useState('');
  const [dashboardInsights, setDashboardInsights] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dashboardAlerts, setDashboardAlerts] = useState([]);

  // Opsi filter untuk user (tetap)
  const jenisOptions = ['Presensi Daerah', 'Presensi Desa'];
  const statusOptions = ['hadir', 'terlambat'];
  const filterOptions = [
    { label: 'Jenis Presensi', key: 'jenis', values: jenisOptions },
    { label: 'Status', key: 'status', values: statusOptions.map(s => s.charAt(0).toUpperCase() + s.slice(1)) },
  ];

  // Opsi filter untuk admin (Kelompok, Desa, Jenis Kelamin, Status)
  const kelompokOptions = [...new Set(allPresensi.map(d => d.kelompok).filter(Boolean))];
  const desaOptions = [...new Set(allPresensi.map(d => d.desa).filter(Boolean))];
  const jenisKelaminOptions = [...new Set(allPresensi.map(d => d.jenis_kelamin).filter(Boolean))];
  const filterOptionsAdmin = [
    { label: 'Kelompok', key: 'kelompok', values: kelompokOptions },
    { label: 'Desa', key: 'desa', values: desaOptions },
    { label: 'Jenis Kelamin', key: 'jenis_kelamin', values: jenisKelaminOptions },
    { label: 'Status', key: 'status', values: statusOptions.map(s => s.charAt(0).toUpperCase() + s.slice(1)) },
  ];

  // Handler filter dropdown
  const handleDropdownApply = (selected) => {
    setFilterDropdown(selected);
    // Sinkron ke filter chart
    setUserStatus(selected.status?.[0]?.toLowerCase() || '');
    // Jenis presensi: jika ada, filter userPresensi (lihat di bawah)
  };
  const handleDropdownClear = () => {
    setFilterDropdown({ jenis: [], status: [] });
    setUserStatus('');
  };

  // Handler filter dropdown admin (update filter kelompok, desa, jenis kelamin, status)
  const handleAdminDropdownApply = (selected) => {
    setAdminFilterDropdown(selected);
  };
  const handleAdminDropdownClear = () => {
    setAdminFilterDropdown({ kelompok: [], desa: [], jenis_kelamin: [], status: [] });
  };

  // Fungsi untuk menghitung statistics cards
  const calculateDashboardStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    // Total presensi hari ini
    const todayPresensi = allPresensi.filter(p => 
      p.waktu_presensi?.split('T')[0] === today
    ).length;
    
    // Total presensi bulan ini
    const thisMonthPresensi = allPresensi.filter(p => {
      const presensiDate = new Date(p.waktu_presensi);
      return presensiDate.getMonth() === thisMonth && 
             presensiDate.getFullYear() === thisYear;
    }).length;
    
    // Attendance rate
    const totalPresensi = allPresensi.length;
    const hadirCount = allPresensi.filter(p => p.status === 'hadir').length;
    const attendanceRate = totalPresensi > 0 ? (hadirCount / totalPresensi * 100).toFixed(1) : 0;
    
    // Total user terdaftar
    const totalUsers = profiles.filter(p => p.role === 'user').length;
    
    // Calculate trends (simple comparison with previous period)
    const previousMonthPresensi = allPresensi.filter(p => {
      const presensiDate = new Date(p.waktu_presensi);
      const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      return presensiDate.getMonth() === prevMonth && 
             presensiDate.getFullYear() === prevYear;
    }).length;
    
    const monthTrend = previousMonthPresensi > 0 ? 
      ((thisMonthPresensi - previousMonthPresensi) / previousMonthPresensi * 100).toFixed(1) : 0;
    
    const stats = [
      {
        title: 'Total Presensi Hari Ini',
        value: todayPresensi,
        trend: 0, // Will be calculated based on previous day
        icon: (
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        iconBg: 'bg-blue-100 dark:bg-blue-900/30'
      },
      {
        title: 'Total Presensi Bulan Ini',
        value: thisMonthPresensi,
        trend: parseFloat(monthTrend),
        icon: (
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        iconBg: 'bg-green-100 dark:bg-green-900/30'
      },
      {
        title: 'Attendance Rate',
        value: `${attendanceRate}%`,
        trend: 0, // Will be calculated based on previous period
        icon: (
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30'
      },
      {
        title: 'Total User Terdaftar',
        value: totalUsers,
        trend: 0, // Will be calculated based on new registrations
        icon: (
          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        ),
        iconBg: 'bg-purple-100 dark:bg-purple-900/30'
      }
    ];
    
    setDashboardStats(stats);
  };

  // Fungsi untuk menghitung attendance trend data
  const calculateAttendanceTrend = () => {
    const last30Days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const trendData = last30Days.map(date => {
      const dayPresensi = allPresensi.filter(p => 
        p.waktu_presensi?.split('T')[0] === date
      );
      return {
        date,
        hadir: dayPresensi.filter(p => p.status === 'hadir').length,
        terlambat: dayPresensi.filter(p => p.status === 'terlambat').length,
        total: dayPresensi.length
      };
    });

    const trendChartData = {
      labels: last30Days.map(date => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
      datasets: [
        {
          label: 'Hadir',
          data: trendData.map(d => d.hadir),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Terlambat',
          data: trendData.map(d => d.terlambat),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    setAttendanceTrendData(trendChartData);
  };

  // Fungsi untuk menghitung status distribution data
  const calculateStatusDistribution = () => {
    const hadir = allPresensi.filter(p => p.status === 'hadir').length;
    const terlambat = allPresensi.filter(p => p.status === 'terlambat').length;
    const total = hadir + terlambat;
    
    const distributionData = {
      labels: ['Hadir', 'Terlambat'],
      datasets: [{
        data: [hadir, terlambat],
        backgroundColor: ['#10b981', '#f59e0b']
      }]
    };

    setStatusDistributionData(distributionData);
  };

  // Fungsi untuk menghitung recent activities
  const calculateRecentActivities = () => {
    const recent = allPresensi
      .sort((a, b) => new Date(b.waktu_presensi) - new Date(a.waktu_presensi))
      .slice(0, 5)
      .map(p => ({
        nama: p.nama_lengkap,
        jenis: p.jenis_presensi,
        status: p.status,
        waktu: p.waktu_presensi,
        kelompok: p.kelompok
      }));

    setRecentActivities(recent);
  };

  // Calculate monthly attendance volume (12 months)
  const calculateMonthlyVolume = () => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0'),
        label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      });
    }
    const counts = months.map(m => {
      return allPresensi.filter(p => {
        if (!p.waktu_presensi) return false;
        const d = new Date(p.waktu_presensi);
        const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0');
        return key === m.key;
      }).length;
    });
    setMonthlyVolumeData({ labels: months.map(m => m.label), values: counts });
  };

  const calculateMixedPresensiType = () => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0'),
        label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      });
    }
    const daerahCounts = months.map(m => {
      return allPresensi.filter(p => {
        if (!p.waktu_presensi) return false;
        if (p.jenis_presensi !== 'Presensi Daerah') return false;
        const d = new Date(p.waktu_presensi);
        const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0');
        return key === m.key;
      }).length;
    });
    const desaCounts = months.map(m => {
      return allPresensi.filter(p => {
        if (!p.waktu_presensi) return false;
        if (p.jenis_presensi !== 'Presensi Desa') return false;
        const d = new Date(p.waktu_presensi);
        const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0');
        return key === m.key;
      }).length;
    });
    setMixedPresensiTypeData({ labels: months.map(m => m.label), daerah: daerahCounts, desa: desaCounts });
  };

  const calculateDesaRanking = () => {
    // Group by desa
    const desaMap = {};
    allPresensi.forEach(p => {
      if (!p.desa) return;
      if (!desaMap[p.desa]) desaMap[p.desa] = 0;
      desaMap[p.desa]++;
    });
    // Sort descending
    const sorted = Object.entries(desaMap).sort((a, b) => b[1] - a[1]);
    setDesaRankingData({ labels: sorted.map(([desa]) => desa), values: sorted.map(([, v]) => v) });
  };

  const calculateDashboardInsights = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    // Top Desa bulan ini
    const desaMap = {};
    allPresensi.forEach(p => {
      if (!p.desa) return;
      const d = new Date(p.waktu_presensi);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        if (!desaMap[p.desa]) desaMap[p.desa] = 0;
        desaMap[p.desa]++;
      }
    });
    const topDesa = Object.entries(desaMap).sort((a, b) => b[1] - a[1])[0];
    // Trend kehadiran bulan ini vs bulan lalu
    const thisMonthCount = allPresensi.filter(p => {
      const d = new Date(p.waktu_presensi);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const prevMonthCount = allPresensi.filter(p => {
      const d = new Date(p.waktu_presensi);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    }).length;
    let trend = 0;
    if (prevMonthCount > 0) trend = ((thisMonthCount - prevMonthCount) / prevMonthCount * 100).toFixed(1);
    // Top kelompok bulan ini
    const kelompokMap = {};
    allPresensi.forEach(p => {
      if (!p.kelompok) return;
      const d = new Date(p.waktu_presensi);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        if (!kelompokMap[p.kelompok]) kelompokMap[p.kelompok] = 0;
        kelompokMap[p.kelompok]++;
      }
    });
    const topKelompok = Object.entries(kelompokMap).sort((a, b) => b[1] - a[1])[0];
    // Compose insights
    const insights = [];
    if (topDesa) insights.push({ icon: '🏆', text: `Desa dengan kehadiran tertinggi bulan ini: ${topDesa[0]} (${topDesa[1]} presensi)` });
    if (trend !== 0) insights.push({ icon: trend > 0 ? '📈' : '📉', text: `Kehadiran bulan ini ${trend > 0 ? 'naik' : 'turun'} ${Math.abs(trend)}% dibanding bulan lalu` });
    if (topKelompok) insights.push({ icon: '⭐', text: `Kelompok dengan kehadiran terbanyak bulan ini: ${topKelompok[0]} (${topKelompok[1]} presensi)` });
    setDashboardInsights(insights);
  };

  const calculateDashboardAlerts = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    // Penurunan kehadiran >30%
    const thisMonthCount = allPresensi.filter(p => {
      const d = new Date(p.waktu_presensi);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const prevMonthCount = allPresensi.filter(p => {
      const d = new Date(p.waktu_presensi);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    }).length;
    let drop = 0;
    if (prevMonthCount > 0) drop = ((thisMonthCount - prevMonthCount) / prevMonthCount * 100).toFixed(1);
    const alerts = [];
    if (drop < -30) {
      alerts.push(`Kehadiran bulan ini turun drastis (${Math.abs(drop)}%) dibanding bulan lalu!`);
    }
    // Desa 0 presensi bulan ini
    const desaList = [...new Set(allPresensi.map(p => p.desa).filter(Boolean))];
    const desaZero = desaList.filter(desa =>
      allPresensi.filter(p => {
        const d = new Date(p.waktu_presensi);
        return p.desa === desa && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length === 0
    );
    if (desaZero.length > 0) {
      alerts.push(`Terdapat desa tanpa presensi bulan ini: ${desaZero.join(', ')}`);
    }
    // Kelompok 0 presensi bulan ini
    const kelompokList = [...new Set(allPresensi.map(p => p.kelompok).filter(Boolean))];
    const kelompokZero = kelompokList.filter(kelompok =>
      allPresensi.filter(p => {
        const d = new Date(p.waktu_presensi);
        return p.kelompok === kelompok && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length === 0
    );
    if (kelompokZero.length > 0) {
      alerts.push(`Terdapat kelompok tanpa presensi bulan ini: ${kelompokZero.join(', ')}`);
    }
    setDashboardAlerts(alerts);
  };

  // Handler for AreaChartMonthly click
  const handleAreaChartMonthClick = (monthLabel) => {
    setSelectedMonth(monthLabel);
  };

  // Ambil role dan data presensi user/admin
  useEffect(() => {
    const fetchRoleAndPresensi = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      // Ambil role dan nama_lengkap user
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, nama_lengkap')
        .eq('id', userData.user.id)
        .single();
      
      if (profile?.role) setRole(profile.role);
      if (profile?.nama_lengkap) setUserName(profile.nama_lengkap);
      
      // Ambil semua profiles untuk statistics
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*');
      setProfiles(allProfiles || []);
      
      // Jika user, ambil data presensi user dari tabel terpisah
      if (profile?.role === 'user' && profile?.nama_lengkap) {
        const [presensiDaerah, presensiDesa] = await Promise.all([
          supabase.from('presensi_daerah').select('*').eq('nama_lengkap', profile.nama_lengkap),
          supabase.from('presensi_desa').select('*').eq('nama_lengkap', profile.nama_lengkap),
        ]);
        
        // Mapping dan tambahkan jenis_presensi
        const dataDaerah = (presensiDaerah.data || []).map(row => ({
          ...row,
          jenis_presensi: 'Presensi Daerah',
          tabel: 'presensi_daerah',
          waktu_presensi: row.waktu_presensi,
        }));
        const dataDesa = (presensiDesa.data || []).map(row => ({
          ...row,
          jenis_presensi: 'Presensi Desa',
          tabel: 'presensi_desa',
          waktu_presensi: row.waktu_presensi,
        }));
        
        // Gabungkan dan urutkan berdasarkan waktu_presensi
        const allUserData = [...dataDaerah, ...dataDesa].sort((a, b) => new Date(a.waktu_presensi) - new Date(b.waktu_presensi));
        setUserPresensi(allUserData);
      }
      
      // Jika admin, ambil semua data presensi dari tabel terpisah
      if (profile?.role === 'admin') {
        const [presensiDaerah, presensiDesa] = await Promise.all([
          supabase.from('presensi_daerah').select('*'),
          supabase.from('presensi_desa').select('*'),
        ]);
        
        // Mapping dan tambahkan jenis_presensi
        const dataDaerah = (presensiDaerah.data || []).map(row => ({
          ...row,
          jenis_presensi: 'Presensi Daerah',
          tabel: 'presensi_daerah',
          waktu_presensi: row.waktu_presensi,
        }));
        const dataDesa = (presensiDesa.data || []).map(row => ({
          ...row,
          jenis_presensi: 'Presensi Desa',
          tabel: 'presensi_desa',
          waktu_presensi: row.waktu_presensi,
        }));
        
        // Gabungkan dan urutkan berdasarkan waktu_presensi
        const allAdminData = [...dataDaerah, ...dataDesa].sort((a, b) => new Date(a.waktu_presensi) - new Date(b.waktu_presensi));
        setAllPresensi(allAdminData);
      }
      setUserLoading(false);
    };
    fetchRoleAndPresensi();

    // Real-time subscription untuk update otomatis
    const subscriptionDaerah = supabase
      .channel('presensi_daerah_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'presensi_daerah' 
      }, () => {
        // Refresh data ketika ada perubahan
        fetchRoleAndPresensi();
      })
      .subscribe();

    const subscriptionDesa = supabase
      .channel('presensi_desa_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'presensi_desa' 
      }, () => {
        // Refresh data ketika ada perubahan
        fetchRoleAndPresensi();
      })
      .subscribe();

    // Cleanup subscriptions
    return () => {
      subscriptionDaerah.unsubscribe();
      subscriptionDesa.unsubscribe();
    };
  }, []);

  // Effect untuk menghitung statistics dan chart data ketika data berubah
  useEffect(() => {
    if (allPresensi.length > 0 || userPresensi.length > 0) {
      const dataToUse = role === 'admin' ? allPresensi : userPresensi;
      
      // Calculate statistics
      calculateDashboardStats();
      
      // Calculate chart data
      calculateAttendanceTrend();
      calculateStatusDistribution();
      calculateRecentActivities();
    }
  }, [allPresensi, userPresensi, profiles, role]);

  // Call in useEffect
  useEffect(() => {
    if (allPresensi.length > 0) {
      calculateMonthlyVolume();
      calculateMixedPresensiType();
      calculateDesaRanking();
      calculateDashboardInsights();
      calculateDashboardAlerts();
    }
  }, [allPresensi]);

  // Filter data presensi admin sesuai status, tanggal, kelompok, desa, jenis kelamin
  const filteredAllPresensi = allPresensi.filter(d => {
    // Filter jenis presensi (default: Daerah saja)
    if (adminJenisPresensi && d.jenis_presensi !== adminJenisPresensi) return false;
    
    // Date range filter
    if (adminDateRange.from || adminDateRange.to) {
      const tgl = d.waktu_presensi ? d.waktu_presensi.split('T')[0] : '';
      if (adminDateRange.from && adminDateRange.to) {
        if (tgl < adminDateRange.from || tgl > adminDateRange.to) return false;
      } else if (adminDateRange.from) {
        if (tgl < adminDateRange.from) return false;
      } else if (adminDateRange.to) {
        if (tgl > adminDateRange.to) return false;
      }
    }
    // Status
    if (adminFilterDropdown.status && adminFilterDropdown.status.length > 0) {
      if (!adminFilterDropdown.status.includes((d.status || '').charAt(0).toUpperCase() + (d.status || '').slice(1))) return false;
    }
    // Kelompok
    if (adminFilterDropdown.kelompok && adminFilterDropdown.kelompok.length > 0) {
      if (!adminFilterDropdown.kelompok.includes(d.kelompok)) return false;
    }
    // Desa
    if (adminFilterDropdown.desa && adminFilterDropdown.desa.length > 0) {
      if (!adminFilterDropdown.desa.includes(d.desa)) return false;
    }
    // Jenis Kelamin
    if (adminFilterDropdown.jenis_kelamin && adminFilterDropdown.jenis_kelamin.length > 0) {
      if (!adminFilterDropdown.jenis_kelamin.includes(d.jenis_kelamin)) return false;
    }
    // Nama (search, case-insensitive)
    if (adminSearchNama && d.nama_lengkap) {
      if (!d.nama_lengkap.toLowerCase().includes(adminSearchNama.toLowerCase())) return false;
    }
    return true;
  });
  // Kelompok list dari data yang sudah difilter
  const filteredKelompokList = [...new Set(filteredAllPresensi.map(d => d.kelompok))];
  
  // Helper function untuk mendapatkan nama bulan
  const getMonthName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const getFilteredBarChartData = (kelompok) => {
    const dataKelompok = filteredAllPresensi.filter(d => d.kelompok === kelompok);
    
    // Group data by month
    const monthlyData = {};
    
    dataKelompok.forEach(d => {
      if (d.waktu_presensi) {
        const date = new Date(d.waktu_presensi);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { hadir: 0, terlambat: 0 };
        }
        
        if (d.status && d.status.toLowerCase() === 'hadir') {
          monthlyData[monthKey].hadir++;
        } else if (d.status && d.status.toLowerCase() === 'terlambat') {
          monthlyData[monthKey].terlambat++;
        }
      }
    });
    
    // Sort months in chronological order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );
    
    const hadirData = sortedMonths.map(month => monthlyData[month].hadir);
    const terlambatData = sortedMonths.map(month => monthlyData[month].terlambat);
    
    return {
      labels: sortedMonths,
      datasets: [
        { label: 'Hadir', data: hadirData, backgroundColor: '#10b981' },
        { label: 'Terlambat', data: terlambatData, backgroundColor: '#f59e0b' },
      ],
    };
  };

  // --- USER: Grafik Riwayat Presensi Sendiri (dengan filter) ---
  // Filter data presensi sesuai status, tanggal, dan jenis presensi
  const filteredUserPresensi = userPresensi.filter(d => {
    const tgl = d.waktu_presensi ? d.waktu_presensi.split('T')[0] : '';
    let match = true;
    
    // Date range filter
    if (userDateRange.from || userDateRange.to) {
      if (userDateRange.from && userDateRange.to) {
        match = tgl >= userDateRange.from && tgl <= userDateRange.to;
      } else if (userDateRange.from) {
        match = tgl >= userDateRange.from;
      } else if (userDateRange.to) {
        match = tgl <= userDateRange.to;
      }
    }
    
    if (userStatus) match = match && d.status && d.status.toLowerCase() === userStatus;
    if (filterDropdown.jenis && filterDropdown.jenis.length > 0) {
      // Mapping jenis presensi dari tabel (default: 'Presensi Umum')
      let jenis = 'Presensi Umum';
      if (d.tabel === 'presensi_daerah') jenis = 'Presensi Daerah';
      if (d.tabel === 'presensi_desa') jenis = 'Presensi Desa';
      match = match && filterDropdown.jenis.includes(jenis);
    }
    return match;
  });

  // Group user data by month
  const userMonthlyData = {};
  
  filteredUserPresensi.forEach(d => {
    if (d.waktu_presensi) {
      const date = new Date(d.waktu_presensi);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!userMonthlyData[monthKey]) {
        userMonthlyData[monthKey] = { hadir: 0, terlambat: 0 };
      }
      
      if (d.status && d.status.toLowerCase() === 'hadir') {
        userMonthlyData[monthKey].hadir++;
      } else if (d.status && d.status.toLowerCase() === 'terlambat') {
        userMonthlyData[monthKey].terlambat++;
      }
    }
  });
  
  // Sort months in chronological order
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedUserMonths = Object.keys(userMonthlyData).sort((a, b) => 
    monthOrder.indexOf(a) - monthOrder.indexOf(b)
  );
  
  const userHadirData = sortedUserMonths.map(month => userMonthlyData[month].hadir);
  const userTerlambatData = sortedUserMonths.map(month => userMonthlyData[month].terlambat);
  
  const userBarChartData = {
    labels: sortedUserMonths,
    datasets: [
      { label: 'Hadir', data: userHadirData, backgroundColor: '#10b981' },
      { label: 'Terlambat', data: userTerlambatData, backgroundColor: '#f59e0b' },
    ],
  };
  const userLineChartData = {
    labels: sortedUserMonths,
    datasets: [
      { label: 'Hadir', data: userHadirData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: false },
      { label: 'Terlambat', data: userTerlambatData, borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', fill: false },
    ],
  };

  if (userLoading) return <SkeletonDashboard />;
  
  // Export handlers
  const handleExportAreaChartPDF = async () => {
    const chartDiv = document.getElementById('area-chart-monthly-export');
    if (!chartDiv) return;
    const canvas = await html2canvas(chartDiv, { backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height + 40] });
    pdf.text('Volume Presensi Bulanan (12 Bulan Terakhir)', 20, 30);
    pdf.addImage(imgData, 'PNG', 20, 40, canvas.width - 40, canvas.height - 40);
    pdf.save('volume-presensi-bulanan.pdf');
  };
  const handleExportAreaChartExcel = () => {
    // Data: monthlyVolumeData.labels, monthlyVolumeData.values
    const wsData = [
      ['Bulan', 'Total Presensi'],
      ...monthlyVolumeData.labels.map((label, i) => [label, monthlyVolumeData.values[i]])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Volume Bulanan');
    XLSX.writeFile(wb, 'volume-presensi-bulanan.xlsx');
  };

  // Filtered presensi for selected month
  const filteredPresensiByMonth = selectedMonth
    ? allPresensi.filter(p => {
        if (!p.waktu_presensi) return false;
        const d = new Date(p.waktu_presensi);
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        return label === selectedMonth;
      })
    : [];

  return (
    <LayoutDashboard pageTitle="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Header dan deskripsi dashboard yang berbeda untuk admin dan user */}
        {role === 'admin' ? (
          <>
            <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">Dashboard Administrator</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-justify">
              Selamat datang, Admin! Anda dapat mengelola data presensi, melihat rekap kehadiran per kelompok, 
              dan memantau statistik kehadiran secara real-time. Gunakan filter di bawah untuk melihat data 
              berdasarkan kelompok, desa, jenis kelamin, dan rentang tanggal.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">Dashboard Peserta</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-justify">
              Selamat datang, {userName}! Di sini Anda dapat melihat riwayat presensi pribadi Anda, 
              memantau kehadiran dan keterlambatan, serta mengakses QR Code untuk melakukan presensi. 
              Gunakan filter untuk melihat data berdasarkan jenis presensi dan status kehadiran.
            </p>
          </>
        )}

        {/* Insight Alert Otomatis */}
        <InsightAlert alerts={dashboardAlerts} />

        {/* Insight Box Otomatis */}
        <InsightBox insights={dashboardInsights} />

        {/* Statistics Cards - Tampilkan untuk admin dan user */}
        {dashboardStats.length > 0 && (
          <StatisticsCards stats={dashboardStats} />
        )}

        {/* Area Chart Monthly Volume */}
        {monthlyVolumeData.labels.length > 0 && (
          <div className="mb-8">
            <div id="area-chart-monthly-export" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Volume Presensi Bulanan (12 Bulan Terakhir)
              </h3>
              <div className="h-72">
                <AreaChartMonthly data={monthlyVolumeData} width="100%" height={260} onBarClick={handleAreaChartMonthClick} selectedMonth={selectedMonth} />
              </div>
            </div>
            {role === 'admin' && monthlyVolumeData.labels.length > 0 && (
              <div className="flex justify-end mb-2 gap-2">
                <button
                  onClick={handleExportAreaChartPDF}
                  aria-label="Export chart sebagai PDF"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Export PDF
                </button>
                <button
                  onClick={handleExportAreaChartExcel}
                  aria-label="Export chart sebagai Excel"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2h8v4H8z" /></svg>
                  Export Excel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tampilkan badge bulan aktif dan tombol reset */}
        {selectedMonth && (
          <div className="flex items-center gap-4 mt-4 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 text-sm font-medium">
              Bulan aktif: {selectedMonth}
            </span>
            <button
              onClick={() => setSelectedMonth(null)}
              aria-label="Reset filter bulan"
              className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Tampilkan tabel presensi jika ada selectedMonth */}
        {selectedMonth && filteredPresensiByMonth.length > 0 && (
          <div className="overflow-x-auto mt-2 mb-8">
            <table className="min-w-full text-sm border rounded-xl overflow-hidden" aria-label="Daftar presensi bulan aktif">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Kelompok</th>
                  <th className="px-3 py-2">Desa</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredPresensiByMonth.map((p, i) => (
                  <tr key={i} className="border-b dark:border-gray-700">
                    <td className="px-3 py-2">{p.nama_lengkap}</td>
                    <td className="px-3 py-2">{p.kelompok}</td>
                    <td className="px-3 py-2">{p.desa}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{p.waktu_presensi ? new Date(p.waktu_presensi).toLocaleDateString('id-ID') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mixed Chart Presensi Type */}
        {mixedPresensiTypeData.labels.length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Perbandingan Presensi Daerah vs Desa (12 Bulan Terakhir)
              </h3>
              <div className="h-72">
                <MixedChartPresensiType data={mixedPresensiTypeData} width="100%" height={260} />
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Bar Desa Ranking */}
        {desaRankingData.labels.length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Ranking Kehadiran per Desa
              </h3>
              <div className="h-96">
                <HorizontalBarDesa data={desaRankingData} width="100%" height={340} />
              </div>
            </div>
          </div>
        )}

        {/* Charts Section - Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Attendance Trend Chart - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Trend Kehadiran (30 Hari Terakhir)
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hadir</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Terlambat</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <LineChartTrend data={attendanceTrendData} width="100%" height={320} />
              </div>
            </div>
          </div>

          {/* Status Distribution Chart - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Distribusi Status Kehadiran
              </h3>
              <div className="h-80 flex items-center justify-center">
                <DoughnutChart 
                  data={statusDistributionData} 
                  width={280} 
                  height={280}
                  centerText={{
                    value: allPresensi.length + userPresensi.length,
                    label: 'Total Presensi'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RecentActivity activities={recentActivities} />
          </div>
          
          {/* Existing Charts - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Filter Panel (mirip gambar) */}
            {role === 'user' && (
              <>
                {/* Mobile: horizontal, tombol kanan ikon + */}
                <div className="flex flex-row items-center gap-2 mb-6 sm:hidden">
                  {/* Dropdown Filter */}
                  <div>
                    <DropdownFilter
                      options={filterOptions}
                      selected={filterDropdown}
                      onApply={handleDropdownApply}
                      onClear={handleDropdownClear}
                      align="left"
                    />
                  </div>
                  {/* Date Range Picker */}
                  <div>
                    <DateRangePicker
                      value={userDateRange}
                      onChange={setUserDateRange}
                    />
                  </div>
                </div>
                {/* Desktop/tablet: label Filter */}
                <div className="hidden sm:flex flex-row items-center gap-3 mb-8">
                  <div className="w-auto">
                    <DropdownFilter
                      options={filterOptions}
                      selected={filterDropdown}
                      onApply={handleDropdownApply}
                      onClear={handleDropdownClear}
                      align="left"
                    />
          </div>
                  <div className="min-w-[15.5rem]">
                    <DateRangePicker
                      value={userDateRange}
                      onChange={setUserDateRange}
                    />
          </div>
        </div>
                {/* Deskripsi filter untuk user */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/60">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Filter Data Presensi</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Gunakan filter di atas untuk melihat data presensi Anda berdasarkan:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 ml-4 list-disc">
                    <li><strong>Jenis Presensi:</strong> Pilih antara Presensi Daerah atau Presensi Desa</li>
                    <li><strong>Status:</strong> Filter berdasarkan status Hadir atau Terlambat</li>
                    <li><strong>Rentang Tanggal:</strong> Pilih periode waktu tertentu untuk melihat data</li>
                  </ul>
        </div>
              </>
            )}
        {/* ADMIN: Grafik Rekap Presensi per Kelompok */}
        {role === 'admin' && (
              <>
                {/* Filter Panel Admin */}
                {/* Mobile: horizontal, tombol kanan ikon + */}
                <div className="flex flex-row items-center gap-2 mb-6 sm:hidden">
                  <div>
                    <DropdownFilter
                      options={filterOptionsAdmin}
                      selected={adminFilterDropdown}
                      onApply={handleAdminDropdownApply}
                      onClear={handleAdminDropdownClear}
                      align="left"
                    />
                  </div>
                  <div>
                    <DateRangePicker
                      value={adminDateRange}
                      onChange={setAdminDateRange}
                    />
                  </div>
                </div>
                {/* Desktop/tablet: label Filter */}
                <div className="hidden sm:flex flex-row items-center gap-3 mb-8">
                  <div className="w-auto">
                    <DropdownFilter
                      options={filterOptionsAdmin}
                      selected={adminFilterDropdown}
                      onApply={handleAdminDropdownApply}
                      onClear={handleAdminDropdownClear}
                      align="left"
                    />
                  </div>
                  <div className="min-w-[15.5rem]">
                    <DateRangePicker
                      value={adminDateRange}
                      onChange={setAdminDateRange}
                    />
                  </div>
                </div>
                
                {/* Search Nama Peserta */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={adminSearchNama}
                    onChange={e => setAdminSearchNama(e.target.value)}
                    placeholder="Cari nama peserta..."
                    aria-label="Cari nama peserta"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Jenis Presensi */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/60">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">Filter Jenis Presensi</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenisPresensi"
                        value="Presensi Daerah"
                        checked={adminJenisPresensi === 'Presensi Daerah'}
                        onChange={(e) => setAdminJenisPresensi(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Presensi Daerah</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenisPresensi"
                        value="Presensi Desa"
                        checked={adminJenisPresensi === 'Presensi Desa'}
                        onChange={(e) => setAdminJenisPresensi(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Presensi Desa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenisPresensi"
                        value=""
                        checked={adminJenisPresensi === ''}
                        onChange={(e) => setAdminJenisPresensi(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Semua</span>
                    </label>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Saat ini menampilkan: <strong>{adminJenisPresensi || 'Semua Jenis Presensi'}</strong>
                  </p>
                </div>
                {/* Deskripsi filter untuk admin - Fixed dark mode colors */}
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700/60">
                  <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Filter Data Administrasi</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Gunakan filter di atas untuk mengelola dan menganalisis data presensi berdasarkan:
                  </p>
                  <ul className="text-sm text-emerald-700 dark:text-emerald-300 mt-2 ml-4 list-disc">
                    <li><strong>Jenis Presensi:</strong> Pilih antara Presensi Daerah, Presensi Desa, atau Semua</li>
                    <li><strong>Kelompok:</strong> Filter berdasarkan kelompok pengajian tertentu</li>
                    <li><strong>Desa:</strong> Lihat data berdasarkan lokasi desa</li>
                    <li><strong>Jenis Kelamin:</strong> Analisis berdasarkan gender peserta</li>
                    <li><strong>Status:</strong> Filter berdasarkan status Hadir atau Terlambat</li>
                    <li><strong>Rentang Tanggal:</strong> Pilih periode waktu untuk analisis</li>
                  </ul>
                </div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                  Rekap Presensi per Kelompok - {adminJenisPresensi || 'Semua Jenis Presensi'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm text-justify">
                  Grafik di bawah menunjukkan statistik kehadiran untuk setiap kelompok berdasarkan jenis presensi yang dipilih. 
                  Data dapat difilter berdasarkan kelompok, desa, jenis kelamin, status kehadiran, dan rentang tanggal. 
                  Klik pada grafik untuk melihat detail lebih lanjut.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredKelompokList.map(kelompok => {
                    const kelompokData = getFilteredBarChartData(kelompok);
                    const totalHadir = kelompokData.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0;
                    const totalTerlambat = kelompokData.datasets[1]?.data.reduce((a, b) => a + b, 0) || 0;
                    const totalPresensi = totalHadir + totalTerlambat;
                    
                    return (
                      <div key={kelompok} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {/* Header dengan statistik */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700/60">
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-3">{kelompok}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Hadir</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{totalHadir}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Terlambat</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{totalTerlambat}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{totalPresensi}</div>
                            </div>
                          </div>
                        </div>
                        {/* Chart */}
                        <div className="p-4">
                          <BarChart01 key={currentTheme + kelompok} data={kelompokData} width={320} height={180} />
            </div>
          </div>
                    );
                  })}
                </div>
              </>
        )}
        {/* USER: Grafik Riwayat Presensi Sendiri */}
        {role === 'user' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Grafik Riwayat Presensi Anda</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Grafik ini menampilkan riwayat presensi pribadi Anda. Anda dapat melihat pola kehadiran, 
                  keterlambatan, dan membandingkan performa kehadiran dari waktu ke waktu. Gunakan filter di atas 
                  untuk melihat data berdasarkan jenis presensi (Daerah/Desa) dan status kehadiran.
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Header dengan statistik */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Statistik Presensi Pribadi</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setUserChartType('bar')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            userChartType === 'bar'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Bar
                        </button>
                        <button
                          onClick={() => setUserChartType('line')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            userChartType === 'line'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Line
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Hadir</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {userHadirData.reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Terlambat</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {userTerlambatData.reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                      <div className="text-right ml-auto">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Presensi</div>
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                          {userHadirData.reduce((a, b) => a + b, 0) + userTerlambatData.reduce((a, b) => a + b, 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Chart */}
                  <div className="p-4">
                  {userChartType === 'bar' ? (
                    <BarChart01 key={currentTheme + '-user'} data={userBarChartData} width={400} height={220} />
                  ) : (
                    <LineChart01 key={currentTheme + '-user'} data={userLineChartData} width={400} height={220} />
                  )}
              {userBarChartData.labels.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">Belum ada data presensi.</div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">Lakukan presensi untuk melihat grafik di sini.</div>
                      </div>
                    )}
                  </div>
            </div>
          </div>
        )}
          </div>
        </div>
        {/** <Banner /> */}
      </div>
    </LayoutDashboard>
  );
}

export default Dashboard;
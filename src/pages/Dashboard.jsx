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
import { supabase } from '../supabaseClient';
import { useThemeProvider } from '../utils/ThemeContext';
import DropdownFilter from '../components/DropdownFilter';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DateRangePicker from '../components/DateRangePicker';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

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

  // if (userLoading) return <div>Loading...</div>;
  if (userLoading) return <DataLoadingSpinner message="Memuat data dashboard..." />;
  

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
        {/* Cards */}
        {/**
        <div className="grid grid-cols-12 gap-6 mb-8">
          <DashboardCard01 />
          <DashboardCard02 />
          <DashboardCard03 />
          <DashboardCard04 />
          <DashboardCard05 />
          <DashboardCard06 />
          <DashboardCard07 />
          <DashboardCard08 />
          <DashboardCard09 />
          <DashboardCard10 />
          <DashboardCard11 />
          <DashboardCard12 />
          <DashboardCard13 />
        </div>
        */}
        {/* ADMIN: Grafik Rekap Presensi per Kelompok */}
        {role === 'admin' && (
          <div className="mb-8">
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
          </div>
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
        {/** <Banner /> */}
      </div>
    </LayoutDashboard>
  );
}

export default Dashboard;
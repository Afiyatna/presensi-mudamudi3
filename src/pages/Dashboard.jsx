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
  const [userDate, setUserDate] = useState('');
  // Tambahan untuk filter panel baru
  const [filterDropdown, setFilterDropdown] = useState({ jenis: [], status: [] });
  // State untuk filter admin
  const [adminFilterDropdown, setAdminFilterDropdown] = useState({ kelompok: [], desa: [], jenis_kelamin: [], status: [] });
  const [adminDate, setAdminDate] = useState('');

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
      // Jika user, ambil data presensi user
      if (profile?.role === 'user' && profile?.nama_lengkap) {
        const { data } = await supabase
          .from('presensi')
          .select('*')
          .eq('nama_lengkap', profile.nama_lengkap)
          .order('waktu_presensi', { ascending: true });
        setUserPresensi(data || []);
      }
      // Jika admin, ambil semua data presensi
      if (profile?.role === 'admin') {
        const { data } = await supabase
          .from('presensi')
          .select('*')
          .order('waktu_presensi', { ascending: true });
        setAllPresensi(data || []);
      }
      setUserLoading(false);
    };
    fetchRoleAndPresensi();
  }, []);

  // Filter data presensi admin sesuai status, tanggal, kelompok, desa, jenis kelamin
  const filteredAllPresensi = allPresensi.filter(d => {
    // Single date
    if (adminDate) {
      const tgl = d.waktu_presensi ? d.waktu_presensi.split('T')[0] : '';
      if (tgl !== adminDate) return false;
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
  const getFilteredBarChartData = (kelompok) => {
    const dataKelompok = filteredAllPresensi.filter(d => d.kelompok === kelompok);
    const tanggalList = [...new Set(dataKelompok.map(d => d.waktu_presensi ? d.waktu_presensi.split('T')[0] : ''))];
    const hadirData = tanggalList.map(tgl => dataKelompok.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status && d.status.toLowerCase() === 'hadir').length);
    const terlambatData = tanggalList.map(tgl => dataKelompok.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status && d.status.toLowerCase() === 'terlambat').length);
    return {
      labels: tanggalList,
      datasets: [
        { label: 'Hadir', data: hadirData, backgroundColor: '#4ade80' },
        { label: 'Terlambat', data: terlambatData, backgroundColor: '#facc15' },
      ],
    };
  };

  // --- USER: Grafik Riwayat Presensi Sendiri (dengan filter) ---
  // Ambil tanggal unik dari presensi user
  const userTanggalList = [...new Set(userPresensi.map(d => d.waktu_presensi ? d.waktu_presensi.split('T')[0] : ''))];
  // Filter tanggal sesuai single date
  const filteredTanggalList = userTanggalList.filter(tgl => {
    if (!userDate) return true;
    return tgl === userDate;
  });
  // Filter data presensi sesuai status, tanggal, dan jenis presensi
  const filteredUserPresensi = userPresensi.filter(d => {
    const tgl = d.waktu_presensi ? d.waktu_presensi.split('T')[0] : '';
    let match = filteredTanggalList.includes(tgl);
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
  // Tanggal unik setelah filter
  const filteredUserTanggalList = [...new Set(filteredUserPresensi.map(d => d.waktu_presensi ? d.waktu_presensi.split('T')[0] : ''))];
  const userHadirData = filteredUserTanggalList.map(tgl => filteredUserPresensi.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status && d.status.toLowerCase() === 'hadir').length);
  const userTerlambatData = filteredUserTanggalList.map(tgl => filteredUserPresensi.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status && d.status.toLowerCase() === 'terlambat').length);
  const userBarChartData = {
    labels: filteredUserTanggalList,
    datasets: [
      { label: 'Hadir', data: userHadirData, backgroundColor: '#4ade80' },
      { label: 'Terlambat', data: userTerlambatData, backgroundColor: '#facc15' },
    ],
  };
  const userLineChartData = {
    labels: filteredUserTanggalList,
    datasets: [
      { label: 'Hadir', data: userHadirData, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.2)', fill: false },
      { label: 'Terlambat', data: userTerlambatData, borderColor: '#facc15', backgroundColor: 'rgba(250,204,21,0.2)', fill: false },
    ],
  };

  // if (userLoading) return <div>Loading...</div>;
  if (userLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  

  return (
    <LayoutDashboard pageTitle="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Header dan deskripsi dashboard */}
        <h1 className="text-2xl font-bold mb-1 text-gray-800">Selamat Datang di Aplikasi Presensi</h1>
        <p className="text-gray-500 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.</p>
        {/* Filter Panel (mirip gambar) */}
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
                    <Datepicker
                      value={userDate}
                      onChange={setUserDate}
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
                    <Datepicker
                      value={userDate}
                      onChange={setUserDate}
                    />
          </div>
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
                    <Datepicker
                      value={adminDate}
                      onChange={setAdminDate}
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
                    <Datepicker
                      value={adminDate}
                      onChange={setAdminDate}
                    />
                  </div>
                </div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Rekap Presensi per Kelompok</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredKelompokList.map(kelompok => (
                <div key={kelompok} className="bg-white dark:bg-gray-800 rounded-xl shadow-xs p-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{kelompok}</h3>
                      <BarChart01 key={currentTheme + kelompok} data={getFilteredBarChartData(kelompok)} width={320} height={180} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* USER: Grafik Riwayat Presensi Sendiri */}
        {role === 'user' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Grafik Riwayat Presensi Anda</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs p-4 max-w-xl">
                  {userChartType === 'bar' ? (
                    <BarChart01 key={currentTheme + '-user'} data={userBarChartData} width={400} height={220} />
                  ) : (
                    <LineChart01 key={currentTheme + '-user'} data={userLineChartData} width={400} height={220} />
                  )}
              {userBarChartData.labels.length === 0 && (
                <div className="text-gray-500 text-center mt-4">Belum ada data presensi.</div>
              )}
            </div>
          </div>
        )}
        {/** <Banner /> */}
      </div>
    </LayoutDashboard>
  );
}

export default Dashboard;
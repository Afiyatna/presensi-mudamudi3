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
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import BottomNavigation from '../components/BottomNavigation';
import BarChart01 from '../charts/BarChart01';
import { supabase } from '../supabaseClient';
import { useThemeProvider } from '../utils/ThemeContext';

function Dashboard() {
  // State untuk role dan data presensi user
  const [role, setRole] = useState(null);
  const [userPresensi, setUserPresensi] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [allPresensi, setAllPresensi] = useState([]); // untuk admin
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentTheme } = useThemeProvider();

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

  // --- ADMIN: Grafik Rekap Presensi per Kelompok ---
  const kelompokList = [...new Set(allPresensi.map(d => d.kelompok))];
  const getBarChartData = (kelompok) => {
    const dataKelompok = allPresensi.filter(d => d.kelompok === kelompok);
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

  // --- USER: Grafik Riwayat Presensi Sendiri ---
  // Ambil tanggal unik dari presensi user
  const userTanggalList = [...new Set(userPresensi.map(d => d.waktu_presensi ? d.waktu_presensi.split('T')[0] : ''))];
  const userHadirData = userTanggalList.map(tgl => userPresensi.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status && d.status.toLowerCase() === 'hadir').length);
  const userTerlambatData = userTanggalList.map(tgl => userPresensi.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status && d.status.toLowerCase() === 'terlambat').length);
  const userBarChartData = {
    labels: userTanggalList,
    datasets: [
      { label: 'Hadir', data: userHadirData, backgroundColor: '#4ade80' },
      { label: 'Terlambat', data: userTerlambatData, backgroundColor: '#facc15' },
    ],
  };

  if (userLoading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Dashboard" />
        
        {/* Main Content */}
        <main className="grow pb-20 lg:pb-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
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
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Rekap Presensi per Kelompok</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kelompokList.map(kelompok => (
                    <div key={kelompok} className="bg-white dark:bg-gray-800 rounded-xl shadow-xs p-4">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{kelompok}</h3>
                      <BarChart01 key={currentTheme + kelompok} data={getBarChartData(kelompok)} width={320} height={180} />
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
                  <BarChart01 key={currentTheme + '-user'} data={userBarChartData} width={400} height={220} />
                  {userBarChartData.labels.length === 0 && (
                    <div className="text-gray-500 text-center mt-4">Belum ada data presensi.</div>
                  )}
                </div>
              </div>
            )}
            {/** <Banner /> */}
          </div>
        </main>
        
        {/* Bottom Navigation - Mobile Only */}
        <BottomNavigation role={role} />
      </div>
    </div>
  );
}

export default Dashboard;
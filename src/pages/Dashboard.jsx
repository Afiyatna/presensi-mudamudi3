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
import LayoutDashboard from '../layouts/LayoutDashboard';
import BarChart01 from '../charts/BarChart01';
import { supabase } from '../supabaseClient';

// Data mock untuk admin (rekap semua kelompok)
const mockAttendanceData = [
  { id: 1, namaLengkap: 'Ahmad Fauzi', namaKelompok: 'Kelompok A', status: 'Hadir', tanggal: '2025-01-03' },
  { id: 2, namaLengkap: 'Siti Nurhaliza', namaKelompok: 'Kelompok B', status: 'Hadir', tanggal: '2025-01-03' },
  { id: 3, namaLengkap: 'Muhammad Rizki', namaKelompok: 'Kelompok A', status: 'Hadir', tanggal: '2025-01-03' },
  { id: 4, namaLengkap: 'Nurul Hidayah', namaKelompok: 'Kelompok C', status: 'Hadir', tanggal: '2025-01-03' },
  { id: 5, namaLengkap: 'Abdul Rahman', namaKelompok: 'Kelompok B', status: 'Hadir', tanggal: '2025-01-04' },
  { id: 6, namaLengkap: 'Fatimah Azzahra', namaKelompok: 'Kelompok A', status: 'Hadir', tanggal: '2025-01-04' },
  { id: 7, namaLengkap: 'Hasan Basri', namaKelompok: 'Kelompok C', status: 'Hadir', tanggal: '2025-01-04' },
  { id: 8, namaLengkap: 'Aisyah Putri', namaKelompok: 'Kelompok B', status: 'Terlambat', tanggal: '2025-01-04' },
  { id: 9, namaLengkap: 'Rizki Pratama', namaKelompok: 'Kelompok A', status: 'Terlambat', tanggal: '2025-01-04' },
  { id: 10, namaLengkap: 'Dewi Sartika', namaKelompok: 'Kelompok C', status: 'Hadir', tanggal: '2025-01-05' },
  { id: 11, namaLengkap: 'Budi Santoso', namaKelompok: 'Kelompok A', status: 'Terlambat', tanggal: '2025-01-05' },
  { id: 12, namaLengkap: 'Rina Marlina', namaKelompok: 'Kelompok B', status: 'Hadir', tanggal: '2025-01-05' },
  { id: 13, namaLengkap: 'Dian Sastro', namaKelompok: 'Kelompok C', status: 'Terlambat', tanggal: '2025-01-05' },
];

function Dashboard() {
  // State untuk role dan data presensi user
  const [role, setRole] = useState(null);
  const [userPresensi, setUserPresensi] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Ambil role dan data presensi user
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
      setUserLoading(false);
    };
    fetchRoleAndPresensi();
  }, []);

  // --- ADMIN: Grafik Rekap Presensi per Kelompok ---
  const kelompokList = [...new Set(mockAttendanceData.map(d => d.namaKelompok))];
  const getBarChartData = (kelompok) => {
    const dataKelompok = mockAttendanceData.filter(d => d.namaKelompok === kelompok);
    const tanggalList = [...new Set(dataKelompok.map(d => d.tanggal))];
    const hadirData = tanggalList.map(tgl => dataKelompok.filter(d => d.tanggal === tgl && d.status === 'Hadir').length);
    const terlambatData = tanggalList.map(tgl => dataKelompok.filter(d => d.tanggal === tgl && d.status === 'Terlambat').length);
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
  const userHadirData = userTanggalList.map(tgl => userPresensi.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status === 'Hadir').length);
  const userTerlambatData = userTanggalList.map(tgl => userPresensi.filter(d => d.waktu_presensi && d.waktu_presensi.startsWith(tgl) && d.status === 'Terlambat').length);
  const userBarChartData = {
    labels: userTanggalList,
    datasets: [
      { label: 'Hadir', data: userHadirData, backgroundColor: '#4ade80' },
      { label: 'Terlambat', data: userTerlambatData, backgroundColor: '#facc15' },
    ],
  };

  if (userLoading) return <div>Loading...</div>;

  return (
    <LayoutDashboard>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Dashboard actions */}
        {/**
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
          </div>
          <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
            <FilterButton align="right" />
            <Datepicker align="right" />
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
              <span className="max-xs:sr-only">Add View</span>
            </button>
          </div>
        </div>
        */}
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
                  <BarChart01 data={getBarChartData(kelompok)} width={320} height={180} />
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
              <BarChart01 data={userBarChartData} width={400} height={220} />
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
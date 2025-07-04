import React from 'react';
import BarChart01 from '../charts/BarChart01';
import LayoutDashboard from '../layouts/LayoutDashboard';

// Daftar kelompok dari Register.jsx
const kelompokList = [
  'BANGUNSARI 1', 'BANGUNSARI 2', 'BRANGSONG', 'BRAYO', 'CAMPUREJO', 'CEPIRING', 
  'DUDUHAN', 'JATIBARANG', 'JATISARI', 'KALIWUNGU', 'KEBONADEM', 'KENDAL', 
  'NGABEAN BARAT', 'NGABEAN TIMUR', 'PAGERSARI', 'PASAR PAGI', 'PATEAN', 'PAGERUYUNG', 
  'PESAWAHAN', 'SEKRANJANG', 'SIROTO', 'WELERI'
];

// Generate dummy data
const generateDummyData = () => {
  let data = [];
  kelompokList.forEach(kelompok => {
    for (let i = 1; i <= 10; i++) {
      const jenis_kelamin = i <= 5 ? 'Laki-laki' : 'Perempuan';
      let status = 'hadir';
      if (i === 1) status = 'terlambat'; // 1 laki-laki
      if (i === 6) status = 'terlambat'; // 1 perempuan
      data.push({
        nama_lengkap: `User ${i} ${kelompok}`,
        jenis_kelamin,
        kelompok,
        desa: 'Dummy Desa',
        waktu_presensi: '2025-07-04 08:00:00',
        status,
      });
    }
  });
  return data;
};
const dummyData = generateDummyData();

const getBarChartData = (kelompok) => {
  const dataKelompok = dummyData.filter(d => d.kelompok === kelompok);
  const hadir = dataKelompok.filter(d => d.status === 'hadir').length;
  const terlambat = dataKelompok.filter(d => d.status === 'terlambat').length;
  return {
    labels: ['Hadir', 'Terlambat'],
    datasets: [
      { label: 'Jumlah', data: [hadir, terlambat], backgroundColor: ['#4ade80', '#f87171'] },
    ],
  };
};

export default function DashboardDummy() {
  return (
    <LayoutDashboard>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Dashboard Dummy Data - Rekap Presensi per Kelompok</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelompokList.map(kelompok => (
            <div key={kelompok} className="bg-white dark:bg-gray-800 rounded-xl shadow-xs p-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{kelompok}</h3>
              <BarChart01 data={getBarChartData(kelompok)} width={320} height={180} />
            </div>
          ))}
        </div>
      </div>
    </LayoutDashboard>
  );
} 
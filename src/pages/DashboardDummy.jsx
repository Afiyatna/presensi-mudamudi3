import React, { useState } from 'react';
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
  const tanggalList = [
    '2025-07-01',
    '2025-07-02',
    '2025-07-03',
    '2025-07-04',
    '2025-07-05',
  ];
  kelompokList.forEach(kelompok => {
    tanggalList.forEach((tanggal, tIdx) => {
      for (let i = 1; i <= 2; i++) { // 2 peserta per tanggal
        const jenis_kelamin = i === 1 ? 'Laki-laki' : 'Perempuan';
        let status = 'hadir';
        if (i === 1 && tIdx === 0) status = 'terlambat'; // 1 laki-laki di tanggal pertama terlambat
        if (i === 2 && tIdx === 1) status = 'terlambat'; // 1 perempuan di tanggal kedua terlambat
        data.push({
          nama_lengkap: `User ${i} ${kelompok} ${tanggal}`,
          jenis_kelamin,
          kelompok,
          desa: 'Dummy Desa',
          waktu_presensi: `${tanggal} 08:00:00`,
          status,
        });
      }
    });
  });
  return data;
};
const dummyData = generateDummyData();

// Ambil list tahun, bulan, tanggal unik dari dummyData
const allDates = dummyData.map(d => d.waktu_presensi.split(' ')[0]);
const allYears = [...new Set(allDates.map(date => date.split('-')[0]))];
const allMonths = [...new Set(allDates.map(date => date.split('-')[1]))];
const allDays = [...new Set(allDates.map(date => date.split('-')[2]))];

// Untuk mapping bulan angka ke nama
const monthNames = [
  '', // dummy agar index 1 = Januari
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function DashboardDummy() {
  // State filter
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Fungsi filter tanggal
  const filterTanggal = (tgl) => {
    const [year, month, day] = tgl.split('-');
    if (selectedYear && year !== selectedYear) return false;
    if (selectedMonth && month !== selectedMonth) return false;
    if (selectedDay && day !== selectedDay) return false;
    return true;
  };

  // Update getBarChartData agar pakai filter
  const getBarChartData = (kelompok) => {
    const dataKelompok = dummyData.filter(d => d.kelompok === kelompok);
    // Ambil list tanggal unik yang sudah difilter
    const tanggalList = [...new Set(dataKelompok.map(d => d.waktu_presensi.split(' ')[0]).filter(filterTanggal))];
    // Hitung jumlah hadir dan terlambat per tanggal
    const hadirData = tanggalList.map(tgl => dataKelompok.filter(d => d.waktu_presensi.startsWith(tgl) && d.status === 'hadir').length);
    const terlambatData = tanggalList.map(tgl => dataKelompok.filter(d => d.waktu_presensi.startsWith(tgl) && d.status === 'terlambat').length);
    // Format label tanggal lokal
    const labels = tanggalList.map(tgl => {
      const [year, month, day] = tgl.split('-');
      return `${day} ${monthNames[parseInt(month, 10)]} ${year}`;
    });
    return {
      labels,
      datasets: [
        { label: 'Hadir', data: hadirData, backgroundColor: '#4ade80' },
        { label: 'Terlambat', data: terlambatData, backgroundColor: '#f87171' },
      ],
    };
  };

  return (
    <LayoutDashboard pageTitle="Dashboard Dummy">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Dashboard Dummy Data - Rekap Presensi per Kelompok</h2>
        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tahun</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-2 py-1">
              <option value="">Semua</option>
              {allYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bulan</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-2 py-1">
              <option value="">Semua</option>
              {allMonths.map(month => (
                <option key={month} value={month}>{monthNames[parseInt(month, 10)]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tanggal</label>
            <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="border rounded px-2 py-1">
              <option value="">Semua</option>
              {allDays.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
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
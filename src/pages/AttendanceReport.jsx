import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabaseClient';

function AttendanceReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const reportRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    // Fetch data asli dari Supabase
    const fetchPresensi = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('presensi').select('*');
      if (error) {
        setAttendanceData([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }
      // Mapping field dari Supabase ke field yang digunakan di tabel
      const mapped = (data || []).map((item, idx) => ({
        id: idx + 1,
        namaLengkap: item.nama_lengkap || '',
        jenisKelamin: item.jenis_kelamin || '',
        namaKelompok: item.kelompok || '',
        namaDesa: item.desa || '',
        waktuPresensi: item.waktu_presensi ? item.waktu_presensi.replace('T', ' ').substring(0, 19) : '',
        status: item.status || '',
      }));
      setAttendanceData(mapped);
      setFilteredData(mapped);
      setLoading(false);
    };
    fetchPresensi();
  }, []);

  useEffect(() => {
    // Filter data based on search and filters
    let filtered = attendanceData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaKelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaDesa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group filter
    if (selectedGroup) {
      filtered = filtered.filter(item => item.namaKelompok === selectedGroup);
    }

    // Village filter
    if (selectedVillage) {
      filtered = filtered.filter(item => item.namaDesa === selectedVillage);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(item => 
        item.waktuPresensi.startsWith(dateFilter)
      );
    }

    setFilteredData(filtered);
  }, [attendanceData, searchTerm, selectedGroup, selectedVillage, dateFilter]);

  // Get unique groups and villages for filters
  const uniqueGroups = [...new Set(attendanceData.map(item => item.namaKelompok))];
  const uniqueVillages = [...new Set(attendanceData.map(item => item.namaDesa))];

  const exportToExcel = () => {
    // Simple CSV export
    const headers = ['No', 'Nama Lengkap', 'Jenis Kelamin', 'Nama Kelompok', 'Nama Desa', 'Waktu Presensi', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => [
        index + 1,
        item.namaLengkap,
        item.jenisKelamin,
        item.namaKelompok,
        item.namaDesa,
        item.waktuPresensi,
        item.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_presensi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi untuk patch warna oklch ke #fff sebelum export
  function patchOklchToHex(element) {
    const elements = element.querySelectorAll('*');
    const originalStyles = [];
    elements.forEach((el, idx) => {
      const style = window.getComputedStyle(el);
      let changed = false;
      const bg = style.backgroundColor;
      const border = style.borderColor;
      let prevBg = null, prevBorder = null;
      if (bg && bg.includes('oklch')) {
        prevBg = el.style.backgroundColor;
        el.style.backgroundColor = '#fff';
        changed = true;
      }
      if (border && border.includes('oklch')) {
        prevBorder = el.style.borderColor;
        el.style.borderColor = '#fff';
        changed = true;
      }
      if (changed) {
        originalStyles.push({ el, prevBg, prevBorder });
      }
    });
    return originalStyles;
  }

  // Fungsi untuk mengembalikan warna semula
  function restorePatchedColors(originalStyles) {
    originalStyles.forEach(({ el, prevBg, prevBorder }) => {
      if (prevBg !== null) el.style.backgroundColor = prevBg;
      if (prevBorder !== null) el.style.borderColor = prevBorder;
    });
  }

  const exportToPDF = async () => {
    setExporting(true);
    // Patch warna oklch ke #fff
    const originalStyles = patchOklchToHex(tableRef.current);
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`rekap_presensi_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat mengekspor PDF');
    }
    // Restore warna semula
    restorePatchedColors(originalStyles);
    setExporting(false);
  };

  const exportToJPG = async () => {
    setExporting(true);
    // Patch warna oklch ke #fff
    const originalStyles = patchOklchToHex(tableRef.current);
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `rekap_presensi_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert('Terjadi kesalahan saat mengekspor JPG');
    }
    // Restore warna semula
    restorePatchedColors(originalStyles);
    setExporting(false);
  };

  return (
    <>
      <style>
        {`
          @media print {
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border { border: 1px solid #d1d5db !important; }
            .print\\:bg-gray-200 { background-color: #e5e7eb !important; }
            .print\\:bg-green-100 { background-color: #dcfce7 !important; }
            .print\\:text-green-800 { color: #166534 !important; }
            .print\\:bg-yellow-100 { background-color: #fef3c7 !important; }
            .print\\:text-yellow-800 { color: #92400e !important; }
            .print\\:bg-red-100 { background-color: #fee2e2 !important; }
            .print\\:text-red-800 { color: #991b1b !important; }
            .print\\:hover\\:bg-transparent:hover { background-color: transparent !important; }
            body { background: white !important; }
            * { color: black !important; }
          }
          /* Override warna Tailwind utama agar html2canvas tidak error dan tetap berwarna */
          .export-area .bg-green-100 { background-color: #dcfce7 !important; }
          .export-area .bg-yellow-100 { background-color: #fef3c7 !important; }
          .export-area .bg-red-100 { background-color: #fee2e2 !important; }
          .export-area .bg-white { background-color: #fff !important; }
          .export-area .bg-gray-800 { background-color: #1f2937 !important; }
          .export-area .bg-gray-50 { background-color: #f9fafb !important; }
          .export-area .text-green-800 { color: #166534 !important; }
          .export-area .text-yellow-800 { color: #92400e !important; }
          .export-area .text-red-800 { color: #991b1b !important; }
          .export-area .text-gray-800 { color: #1f2937 !important; }
          .export-area .text-gray-100 { color: #f3f4f6 !important; }
          .export-area .text-gray-600 { color: #4b5563 !important; }
          .export-area .text-gray-400 { color: #9ca3af !important; }
          .export-area .text-gray-500 { color: #6b7280 !important; }
          .export-area .border-gray-100 { border-color: #f3f4f6 !important; }
          .export-area .border-gray-700\\/60 { border-color: #37415199 !important; }
        `}
      </style>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Site header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="grow export-area" ref={reportRef}>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Rekap Presensi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Laporan kehadiran peserta pengajian
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Tanggal: {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Filters and Actions */}
              <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 mb-8 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cari
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari nama, kelompok, atau desa..."
                      className="form-input w-full"
                    />
                  </div>

                  {/* Group Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kelompok
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="">Semua Kelompok</option>
                      {uniqueGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  {/* Village Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Desa
                    </label>
                    <select
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="">Semua Desa</option>
                      {uniqueVillages.map(village => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="form-input w-full"
                    />
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedGroup('');
                        setSelectedVillage('');
                        setDateFilter('');
                      }}
                      className="btn bg-gray-500 hover:bg-gray-600 text-white w-full"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={exportToExcel}
                    className="btn bg-green-500 hover:bg-green-600 text-white"
                    disabled={exporting}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="btn bg-red-500 hover:bg-red-600 text-white"
                    disabled={exporting}
                  >
                    {exporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    Export PDF
                  </button>
                  <button
                    onClick={exportToJPG}
                    className="btn bg-purple-500 hover:bg-purple-600 text-white"
                    disabled={exporting}
                  >
                    {exporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    Download JPG
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 print:shadow-none print:border print:border-gray-300">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Peserta</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{filteredData.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 print:shadow-none print:border print:border-gray-300">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hadir</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {filteredData.filter(item => item.status.toLowerCase() === 'hadir').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 print:shadow-none print:border print:border-gray-300">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terlambat</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {filteredData.filter(item => item.status.toLowerCase() === 'terlambat').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 print:shadow-none print:border print:border-gray-300">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tidak Hadir</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {filteredData.filter(item => item.status.toLowerCase() === 'tidak hadir').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Table - Desktop */}
              <div ref={tableRef} className="bg-white dark:bg-gray-800 shadow-xs rounded-xl print:shadow-none print:border print:border-gray-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Tabel Rekap Presensi
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Menampilkan {filteredData.length} dari {attendanceData.length} peserta
                  </p>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data...</span>
                    </div>
                  ) : (
                    <table className="table-auto w-full">
                      <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 print:bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">No</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">Nama Lengkap</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">Jenis Kelamin</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">Nama Kelompok</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">Nama Desa</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">Waktu Presensi</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="font-semibold">Status</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p>Tidak ada data presensi yang ditemukan</p>
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 print:hover:bg-transparent">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-800 dark:text-gray-100 font-medium">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-800 dark:text-gray-100 font-medium">
                                  {item.namaLengkap}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-600 dark:text-gray-400">
                                  {item.jenisKelamin}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-600 dark:text-gray-400">
                                  {item.namaKelompok}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-600 dark:text-gray-400">
                                  {item.namaDesa}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-600 dark:text-gray-400">
                                  {item.waktuPresensi}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.status.toLowerCase() === 'hadir' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 print:bg-green-100 print:text-green-800'
                                    : item.status.toLowerCase() === 'terlambat'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 print:bg-red-100 print:text-red-800'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 print:bg-red-100 print:text-red-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data...</span>
                    </div>
                  ) : filteredData.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Tidak ada data presensi yang ditemukan</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {filteredData.map((item, index) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                  {item.namaLengkap}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.jenisKelamin}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.status.toLowerCase() === 'hadir' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : item.status.toLowerCase() === 'terlambat'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">Kelompok</p>
                              <p className="text-gray-900 dark:text-gray-100">{item.namaKelompok}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">Desa</p>
                              <p className="text-gray-900 dark:text-gray-100">{item.namaDesa}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Waktu Presensi</p>
                            <p className="text-gray-900 dark:text-gray-100 text-sm">{item.waktuPresensi}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default AttendanceReport; 
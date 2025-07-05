import React, { useState, useMemo, useRef } from 'react';
import LayoutDashboard from '../layouts/LayoutDashboard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const kelompokList = [
  'BANGUNSARI 1', 'BANGUNSARI 2', 'BRANGSONG', 'BRAYO', 'CAMPUREJO', 'CEPIRING', 
  'DUDUHAN', 'JATIBARANG', 'JATISARI', 'KALIWUNGU', 'KEBONADEM', 'KENDAL', 
  'NGABEAN BARAT', 'NGABEAN TIMUR', 'PAGERSARI', 'PASAR PAGI', 'PATEAN', 'PAGERUYUNG', 
  'PESAWAHAN', 'SEKRANJANG', 'SIROTO', 'WELERI'
];

const generateDummyData = () => {
  let data = [];
  kelompokList.forEach(kelompok => {
    for (let i = 1; i <= 10; i++) {
      const jenis_kelamin = i <= 5 ? 'Laki-laki' : 'Perempuan';
      let status = 'hadir';
      if (i === 1) status = 'terlambat';
      if (i === 6) status = 'terlambat';
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

export default function AttendanceReportDummy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const tableRef = useRef(null);

  // Unique desa
  const uniqueVillages = useMemo(() => [...new Set(dummyData.map(item => item.desa))], []);

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = dummyData;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedGroup) {
      filtered = filtered.filter(item => item.kelompok === selectedGroup);
    }
    if (selectedVillage) {
      filtered = filtered.filter(item => item.desa === selectedVillage);
    }
    if (dateFilter) {
      filtered = filtered.filter(item => item.waktu_presensi.startsWith(dateFilter));
    }
    return filtered;
  }, [searchTerm, selectedGroup, selectedVillage, dateFilter]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Summary
  const totalPeserta = filteredData.length;
  const totalHadir = filteredData.filter(item => item.status === 'hadir').length;
  const totalTerlambat = filteredData.filter(item => item.status === 'terlambat').length;

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = ['No', 'Nama Lengkap', 'Jenis Kelamin', 'Kelompok', 'Desa', 'Waktu Presensi', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => [
        index + 1,
        item.nama_lengkap,
        item.jenis_kelamin,
        item.kelompok,
        item.desa,
        item.waktu_presensi,
        item.status
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_presensi_dummy_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true);
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
      pdf.save(`rekap_presensi_dummy_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert('Terjadi kesalahan saat mengekspor PDF');
    }
    setExporting(false);
  };

  // Export to JPG
  const exportToJPG = async () => {
    setExporting(true);
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
      link.download = `rekap_presensi_dummy_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      alert('Terjadi kesalahan saat mengekspor JPG');
    }
    setExporting(false);
  };

  return (
    <LayoutDashboard pageTitle="Rekap Presensi Dummy">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Peserta</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalPeserta}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Hadir</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalHadir}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Terlambat</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalTerlambat}</div>
          </div>
        </div>
        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cari</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari nama, kelompok, atau desa..."
                className="form-input w-full"
              />
            </div>
            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kelompok</label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="form-select w-full"
              >
                <option value="">Semua Kelompok</option>
                {kelompokList.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            {/* Village Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Desa</label>
              <select
                value={selectedVillage}
                onChange={e => setSelectedVillage(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal</label>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
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
            >
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="btn bg-red-500 hover:bg-red-600 text-white"
              disabled={exporting}
            >
              Export PDF
            </button>
            <button
              onClick={exportToJPG}
              className="btn bg-purple-500 hover:bg-purple-600 text-white"
              disabled={exporting}
            >
              Export JPG
            </button>
          </div>
        </div>
        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table ref={tableRef} className="table-auto w-full">
            <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left">No</th>
                <th className="px-6 py-3 text-left">Nama Lengkap</th>
                <th className="px-6 py-3 text-left">Jenis Kelamin</th>
                <th className="px-6 py-3 text-left">Kelompok</th>
                <th className="px-6 py-3 text-left">Desa</th>
                <th className="px-6 py-3 text-left">Waktu Presensi</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {pagedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.nama_lengkap}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.jenis_kelamin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.kelompok}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.desa}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.waktu_presensi}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'hadir'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="btn bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </LayoutDashboard>
  );
} 
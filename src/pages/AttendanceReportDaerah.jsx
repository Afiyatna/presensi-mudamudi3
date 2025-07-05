import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabaseClient';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

function AttendanceReportDaerah() {
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
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState('');

  useEffect(() => {
    const fetchPresensi = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('presensi_daerah').select('*');
      if (error) {
        setAttendanceData([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }
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
    let filtered = attendanceData;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaKelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaDesa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedGroup) {
      filtered = filtered.filter(item => item.namaKelompok === selectedGroup);
    }
    if (selectedVillage) {
      filtered = filtered.filter(item => item.namaDesa === selectedVillage);
    }
    if (dateFilter) {
      filtered = filtered.filter(item => item.waktuPresensi.startsWith(dateFilter));
    }
    if (selectedGender) {
      filtered = filtered.filter(item => item.jenisKelamin === selectedGender);
    }
    setFilteredData(filtered);
  }, [attendanceData, searchTerm, selectedGroup, selectedVillage, dateFilter, selectedGender]);

  const uniqueGroups = [...new Set(attendanceData.map(item => item.namaKelompok))];
  const uniqueVillages = [...new Set(attendanceData.map(item => item.namaDesa))];

  const exportToExcel = () => {
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
    link.setAttribute('download', `rekap_presensi_daerah_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  function restorePatchedColors(originalStyles) {
    originalStyles.forEach(({ el, prevBg, prevBorder }) => {
      if (prevBg !== null) el.style.backgroundColor = prevBg;
      if (prevBorder !== null) el.style.borderColor = prevBorder;
    });
  }

  const exportToPDF = async () => {
    setExporting(true);
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
      pdf.save(`rekap_presensi_daerah_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat mengekspor PDF');
    }
    restorePatchedColors(originalStyles);
    setExporting(false);
  };

  const exportToJPG = async () => {
    setExporting(true);
    const originalStyles = patchOklchToHex(tableRef.current);
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `rekap_presensi_daerah_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      alert('Terjadi kesalahan saat mengekspor JPG');
    }
    restorePatchedColors(originalStyles);
    setExporting(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Rekap Presensi Daerah" />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate('/attendance-report-menu')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-all">← Kembali</button>
            </div>
            {/* Filters and Actions */}
            <div className="bg-white shadow-xs rounded-xl p-6 mb-8 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari nama, kelompok, atau desa..." className="form-input w-full" />
                </div>
                {/* Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok</label>
                  <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="form-select w-full">
                    <option value="">Semua Kelompok</option>
                    {uniqueGroups.map((g, i) => <option key={i} value={g}>{g}</option>)}
                  </select>
                </div>
                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} className="form-select w-full">
                    <option value="">Semua</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                {/* Village Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Desa</label>
                  <select value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)} className="form-select w-full">
                    <option value="">Semua Desa</option>
                    {uniqueVillages.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                  <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="form-input w-full" />
                </div>
                {/* Clear Filters */}
                <div className="flex items-end">
                  <button onClick={() => { setSearchTerm(''); setSelectedGroup(''); setSelectedVillage(''); setDateFilter(''); setSelectedGender(''); }} className="btn bg-gray-500 hover:bg-gray-600 text-white w-full">Reset Filter</button>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={exportToExcel} className="btn bg-green-500 hover:bg-green-600 text-white" disabled={exporting}>Export Excel</button>
                <button onClick={exportToPDF} className="btn bg-red-500 hover:bg-red-600 text-white" disabled={exporting}>Export PDF</button>
                <button onClick={exportToJPG} className="btn bg-purple-500 hover:bg-purple-600 text-white" disabled={exporting}>Download JPG</button>
              </div>
            </div>
            {/* Statistik Kehadiran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 flex items-center gap-4 shadow animate-fade-in">
                <div className="bg-blue-200 rounded-full p-3"><svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm6 4a4 4 0 0 0-3-3.87M6 16a4 4 0 0 0-3 3.87"/></svg></div>
                <div>
                  <div className="text-sm text-blue-700 font-semibold">Total Peserta</div>
                  <div className="text-2xl font-bold text-blue-900"><CountUp end={filteredData.length} duration={1} /></div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 flex items-center gap-4 shadow animate-fade-in">
                <div className="bg-green-200 rounded-full p-3"><svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg></div>
                <div>
                  <div className="text-sm text-green-700 font-semibold">Hadir</div>
                  <div className="text-2xl font-bold text-green-900"><CountUp end={filteredData.filter(d => d.status === 'hadir').length} duration={1} /></div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-6 flex items-center gap-4 shadow animate-fade-in">
                <div className="bg-yellow-200 rounded-full p-3"><svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg></div>
                <div>
                  <div className="text-sm text-yellow-700 font-semibold">Terlambat</div>
                  <div className="text-2xl font-bold text-yellow-900"><CountUp end={filteredData.filter(d => d.status === 'terlambat').length} duration={1} /></div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 flex items-center gap-4 shadow animate-fade-in">
                <div className="bg-red-200 rounded-full p-3"><svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6"/></svg></div>
                <div>
                  <div className="text-sm text-red-700 font-semibold">Tidak Hadir</div>
                  <div className="text-2xl font-bold text-red-900"><CountUp end={filteredData.filter(d => d.status === 'tidak hadir').length} duration={1} /></div>
                </div>
              </div>
            </div>
            {/* Table */}
            <div ref={tableRef} className="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2">No</th>
                    <th className="px-4 py-2">Nama Lengkap</th>
                    <th className="px-4 py-2">Jenis Kelamin</th>
                    <th className="px-4 py-2">Nama Kelompok</th>
                    <th className="px-4 py-2">Nama Desa</th>
                    <th className="px-4 py-2">Waktu Presensi</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8">Tidak ada data</td></tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50">
                        <td className="px-4 py-2 text-center">{item.id}</td>
                        <td className="px-4 py-2">{item.namaLengkap}</td>
                        <td className="px-4 py-2">{item.jenisKelamin}</td>
                        <td className="px-4 py-2">{item.namaKelompok}</td>
                        <td className="px-4 py-2">{item.namaDesa}</td>
                        <td className="px-4 py-2">{item.waktuPresensi}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AttendanceReportDaerah; 
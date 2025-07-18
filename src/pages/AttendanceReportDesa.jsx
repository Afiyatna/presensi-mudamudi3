import React, { useState, useEffect, useRef } from 'react';
import LayoutDashboard from '../layouts/LayoutDashboard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabaseClient';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import DropdownFilter from '../components/DropdownFilter';
import DateRangePicker from '../components/DateRangePicker';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

function AttendanceReportDesa() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState('');
  const [filterDropdown, setFilterDropdown] = useState({ kelompok: [], desa: [], jenis_kelamin: [], status: [] });

  const kelompokOptions = [...new Set(attendanceData.map(item => item.namaKelompok))];
  const desaOptions = [...new Set(attendanceData.map(item => item.namaDesa))];
  const jenisKelaminOptions = ['Laki-laki', 'Perempuan'];
  const statusOptions = ['hadir', 'terlambat'];
  const filterOptions = [
    { label: 'Kelompok', key: 'kelompok', values: kelompokOptions },
    { label: 'Desa', key: 'desa', values: desaOptions },
    { label: 'Jenis Kelamin', key: 'jenis_kelamin', values: jenisKelaminOptions },
    { label: 'Status', key: 'status', values: statusOptions.map(s => s.charAt(0).toUpperCase() + s.slice(1)) },
  ];

  const handleDropdownApply = (selected) => setFilterDropdown(selected);
  const handleDropdownClear = () => setFilterDropdown({ kelompok: [], desa: [], jenis_kelamin: [], status: [] });

  useEffect(() => {
    const fetchPresensi = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('presensi_desa').select('*');
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
    if (filterDropdown.kelompok && filterDropdown.kelompok.length > 0) {
      filtered = filtered.filter(item => filterDropdown.kelompok.includes(item.namaKelompok));
    }
    if (filterDropdown.desa && filterDropdown.desa.length > 0) {
      filtered = filtered.filter(item => filterDropdown.desa.includes(item.namaDesa));
    }
    if (filterDropdown.jenis_kelamin && filterDropdown.jenis_kelamin.length > 0) {
      filtered = filtered.filter(item => filterDropdown.jenis_kelamin.includes(item.jenisKelamin));
    }
    if (filterDropdown.status && filterDropdown.status.length > 0) {
      filtered = filtered.filter(item => filterDropdown.status.includes(item.status.charAt(0).toUpperCase() + item.status.slice(1)));
    }
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(item => {
        const presensiDate = item.waktuPresensi ? item.waktuPresensi.split(' ')[0] : '';
        
        if (dateRange.from && dateRange.to) {
          // Filter dengan rentang tanggal
          return presensiDate >= dateRange.from && presensiDate <= dateRange.to;
        } else if (dateRange.from) {
          // Filter dari tanggal tertentu
          return presensiDate >= dateRange.from;
        } else if (dateRange.to) {
          // Filter sampai tanggal tertentu
          return presensiDate <= dateRange.to;
        }
        return true;
      });
    }
    setFilteredData(filtered);
  }, [attendanceData, searchTerm, filterDropdown, dateRange]);

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
    link.setAttribute('download', `rekap_presensi_desa_${new Date().toISOString().split('T')[0]}.csv`);
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

  const exportingStyle = `
    .exporting-desktop .overflow-x-auto { overflow-x: visible !important; }
    .exporting-desktop table { min-width: 900px !important; width: 100% !important; }
    .exporting-desktop .md\\:block { display: block !important; }
    .exporting-desktop .md\\:hidden { display: none !important; }
  `;
  if (typeof window !== 'undefined' && !document.getElementById('exporting-desktop-style')) {
    const style = document.createElement('style');
    style.id = 'exporting-desktop-style';
    style.innerHTML = exportingStyle;
    document.head.appendChild(style);
  }

  const exportToPDF = async () => {
    setExporting(true);
    // Render ulang tabel ke offscreen container lebar desktop
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-9999px';
    offscreen.style.width = '1200px';
    offscreen.style.background = '#fff';
    offscreen.innerHTML = tableRef.current.outerHTML;
    document.body.appendChild(offscreen);
    const table = offscreen.querySelector('table');
    const originalStyles = patchOklchToHex(table);
    try {
      const canvas = await html2canvas(table, {
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
      pdf.save(`rekap_presensi_desa_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat mengekspor PDF');
    }
    restorePatchedColors(originalStyles);
    document.body.removeChild(offscreen);
    setExporting(false);
  };

  const exportToJPG = async () => {
    setExporting(true);
    // Render ulang tabel ke offscreen container lebar desktop
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-9999px';
    offscreen.style.width = '1200px';
    offscreen.style.background = '#fff';
    offscreen.innerHTML = tableRef.current.outerHTML;
    document.body.appendChild(offscreen);
    const table = offscreen.querySelector('table');
    const originalStyles = patchOklchToHex(table);
    try {
      const canvas = await html2canvas(table, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `rekap_presensi_desa_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      alert('Terjadi kesalahan saat mengekspor JPG');
    }
    restorePatchedColors(originalStyles);
    document.body.removeChild(offscreen);
    setExporting(false);
  };

  return (
    <LayoutDashboard pageTitle="Rekap Presensi Desa">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/attendance-report-menu')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-all">← Kembali</button>
        </div>
        {loading ? (
          <DataLoadingSpinner message="Memuat data presensi desa..." />
        ) : (
          <>
            {/* Statistik Kehadiran */}
            <div className="grid grid-cols-3 gap-2 mb-4 w-full sm:flex sm:flex-row sm:gap-6 sm:mb-8">
              <div className="bg-blue-50 rounded-xl flex items-center gap-2 sm:gap-3 shadow animate-fade-in p-2 sm:p-6">
                <div className="bg-blue-200 rounded-full p-2 sm:p-3"><svg className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm6 4a4 4 0 0 0-3-3.87M6 16a4 4 0 0 0-3 3.87"/></svg></div>
                <div>
                  <div className="text-xs sm:text-sm text-blue-700 font-semibold break-words text-center w-full">Total Peserta</div>
                  <div className="text-2xl font-bold text-blue-900"><CountUp end={filteredData.length} duration={1} /></div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl flex items-center gap-2 sm:gap-3 shadow animate-fade-in p-2 sm:p-6">
                <div className="bg-green-200 rounded-full p-2 sm:p-3"><svg className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg></div>
                <div>
                  <div className="text-xs sm:text-sm text-green-700 font-semibold break-words text-center w-full">Hadir</div>
                  <div className="text-2xl font-bold text-green-900"><CountUp end={filteredData.filter(d => d.status === 'hadir').length} duration={1} /></div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl flex items-center gap-2 sm:gap-3 shadow animate-fade-in p-2 sm:p-6">
                <div className="bg-yellow-200 rounded-full p-2 sm:p-3"><svg className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg></div>
                <div>
                  <div className="text-[9px] sm:text-sm text-yellow-700 font-semibold break-words text-center w-full leading-tight tracking-tight whitespace-pre-line">
                    Terlambat
                  </div>
                  <div className="text-2xl font-bold text-yellow-900"><CountUp end={filteredData.filter(d => d.status === 'terlambat').length} duration={1} /></div>
                </div>
              </div>
            </div>
            {/* Filters and Actions */}
            <div className="bg-white shadow-xs rounded-xl p-6 mb-8 print:hidden">
              {/* Mobile: filter bar horizontal */}
              <div className="flex flex-row items-center gap-2 mb-6 sm:hidden">
                <DropdownFilter
                  options={filterOptions}
                  selected={filterDropdown}
                  onApply={handleDropdownApply}
                  onClear={handleDropdownClear}
                  align="left"
                />
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Pilih rentang tanggal"
                />
              </div>
              {/* Desktop: filter grid */}
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari nama, kelompok, atau desa..." className="form-input w-full" />
                </div>
                {/* Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok</label>
                  <select value={filterDropdown.kelompok[0] || ''} onChange={e => setFilterDropdown(f => ({ ...f, kelompok: e.target.value ? [e.target.value] : [] }))} className="form-select w-full">
                    <option value="">Semua Kelompok</option>
                    {uniqueGroups.map((g, i) => <option key={i} value={g}>{g}</option>)}
                  </select>
                </div>
                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <select value={filterDropdown.jenis_kelamin[0] || ''} onChange={e => setFilterDropdown(f => ({ ...f, jenis_kelamin: e.target.value ? [e.target.value] : [] }))} className="form-select w-full">
                    <option value="">Semua</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                {/* Village Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Desa</label>
                  <select value={filterDropdown.desa[0] || ''} onChange={e => setFilterDropdown(f => ({ ...f, desa: e.target.value ? [e.target.value] : [] }))} className="form-select w-full">
                    <option value="">Semua Desa</option>
                    {uniqueVillages.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Tanggal</label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Pilih rentang tanggal"
                  />
                </div>
                {/* Clear Filters */}
                <div className="flex items-end">
                  <button onClick={() => { setSearchTerm(''); setFilterDropdown({ kelompok: [], desa: [], jenis_kelamin: [], status: [] }); setDateRange({ from: '', to: '' }); }} className="btn bg-gray-500 hover:bg-gray-600 text-white w-full">Reset Filter</button>
                </div>
              </div>
              {/* Action Buttons - Mobile */}
              <div className="flex flex-row gap-2 sm:hidden">
                <button onClick={exportToExcel} className="btn bg-green-500 hover:bg-green-600 text-white px-3 py-2 min-w-[56px]" disabled={exporting}>Excel</button>
                <button onClick={exportToPDF} className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 min-w-[56px]" disabled={exporting}>PDF</button>
                <button onClick={exportToJPG} className="btn bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 min-w-[56px]" disabled={exporting}>JPG</button>
              </div>
              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex gap-3 flex-wrap">
                <button onClick={exportToExcel} className="btn bg-green-500 hover:bg-green-600 text-white" disabled={exporting}>Export Excel</button>
                <button onClick={exportToPDF} className="btn bg-red-500 hover:bg-red-600 text-white" disabled={exporting}>Export PDF</button>
                <button onClick={exportToJPG} className="btn bg-purple-500 hover:bg-purple-600 text-white" disabled={exporting}>Download JPG</button>
              </div>
            </div>
            {/* Table Presensi - Tampil di semua ukuran layar */}
            <div ref={tableRef} className="bg-white rounded-xl shadow p-4 w-full overflow-x-auto">
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
                      <tr key={idx} className="hover:bg-green-50">
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
          </>
        )}
      </div>
    </LayoutDashboard>
  );
}

export default AttendanceReportDesa; 
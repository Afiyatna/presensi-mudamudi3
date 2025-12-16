import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { presensiKegiatanService } from '../lib/presensiKegiatanService';
import { kegiatanService } from '../lib/kegiatanService';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import CalendarView from '../components/CalendarView';
import BulkActions from '../components/BulkActions';
import { toast } from 'react-hot-toast';

export default function RiwayatPresensiTerintegrasi() {
  const [presensiList, setPresensiList] = useState([]);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPresensi, setSelectedPresensi] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [filters, setFilters] = useState({
    kegiatan: '',
    status: '',
    tanggal: '',
    kelompok: '',
    desa: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchPresensiList();
    fetchKegiatanList();
  }, [filters]);

  const fetchPresensiList = async () => {
    try {
      setLoading(true);
      let { data, error } = await presensiKegiatanService.getAllPresensiKegiatan();
      
      if (error) throw error;
      
      // Apply filters
      if (filters.kegiatan) {
        data = data.filter(presensi => presensi.kegiatan?.id === filters.kegiatan);
      }
      if (filters.status) {
        data = data.filter(presensi => presensi.status === filters.status);
      }
      if (filters.tanggal) {
        data = data.filter(presensi => {
          const presensiDate = new Date(presensi.waktu_presensi).toISOString().split('T')[0];
          return presensiDate === filters.tanggal;
        });
      }
      if (filters.kelompok) {
        data = data.filter(presensi => presensi.kelompok === filters.kelompok);
      }
      if (filters.desa) {
        data = data.filter(presensi => presensi.desa === filters.desa);
      }
      
      setPresensiList(data || []);
    } catch (error) {
      console.error('Error fetching presensi list:', error);
      toast.error('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  };

  const fetchKegiatanList = async () => {
    try {
      const { data, error } = await kegiatanService.getAllKegiatan();
      if (error) throw error;
      setKegiatanList(data || []);
    } catch (error) {
      console.error('Error fetching kegiatan list:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectPresensi = (presensiId) => {
    setSelectedPresensi(prev => {
      if (prev.includes(presensiId)) {
        return prev.filter(id => id !== presensiId);
      } else {
        return [...prev, presensiId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPresensi.length === presensiList.length) {
      setSelectedPresensi([]);
    } else {
      setSelectedPresensi(presensiList.map(presensi => presensi.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPresensi.length === 0) {
      toast.error('Pilih presensi yang akan dihapus');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedPresensi.length} presensi?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('presensi_kegiatan')
        .delete()
        .in('id', selectedPresensi);

      if (error) throw error;

      toast.success(`${selectedPresensi.length} presensi berhasil dihapus`);
      setSelectedPresensi([]);
      fetchPresensiList();
    } catch (error) {
      console.error('Error bulk deleting presensi:', error);
      toast.error('Gagal menghapus presensi');
    }
  };

  const handleBulkExportPDF = () => {
    if (selectedPresensi.length === 0) {
      toast.error('Pilih presensi yang akan di-export');
      return;
    }
    
    const selectedData = presensiList.filter(presensi => 
      selectedPresensi.includes(presensi.id)
    );
    exportToPDF(selectedData, 'presensi-terpilih');
  };

  const handleBulkExportExcel = () => {
    if (selectedPresensi.length === 0) {
      toast.error('Pilih presensi yang akan di-export');
      return;
    }
    
    const selectedData = presensiList.filter(presensi => 
      selectedPresensi.includes(presensi.id)
    );
    exportToExcel(selectedData, 'presensi-terpilih');
  };

  const exportToPDF = (data, filename) => {
    try {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Laporan Presensi Kegiatan', 20, 20);
      doc.setFontSize(12);
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);
      doc.text(`Total Data: ${data.length}`, 20, 40);
      
      // Add table headers
      const headers = ['Nama', 'Kegiatan', 'Tanggal', 'Waktu', 'Status', 'Lokasi'];
      const startY = 60;
      let currentY = startY;
      
      // Set table styling
      doc.setFontSize(10);
      doc.setFillColor(240, 240, 240);
      
      // Draw header row
      headers.forEach((header, index) => {
        const x = 20 + (index * 30);
        doc.rect(x, currentY - 5, 30, 8, 'F');
        doc.text(header, x + 2, currentY);
      });
      
      currentY += 10;
      
      // Add data rows
      data.forEach((presensi, rowIndex) => {
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        
        const rowData = [
          presensi.nama_lengkap || '-',
          presensi.kegiatan?.nama_kegiatan || '-',
          formatDate(presensi.waktu_presensi),
          formatTime(presensi.waktu_presensi),
          presensi.status,
          presensi.kegiatan?.lokasi || '-'
        ];
        
        rowData.forEach((text, index) => {
          const x = 20 + (index * 30);
          doc.text(text.substring(0, 15), x + 2, currentY);
        });
        
        currentY += 8;
      });
      
      // Save PDF
      doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Export PDF berhasil');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal export PDF');
    }
  };

  const exportToExcel = (data, filename) => {
    try {
      const XLSX = require('xlsx');
      
      // Prepare data for Excel
      const excelData = data.map(presensi => ({
        'Nama Lengkap': presensi.nama_lengkap || '-',
        'Kelompok': presensi.kelompok || '-',
        'Desa': presensi.desa || '-',
        'Jenis Kelamin': presensi.jenis_kelamin || '-',
        'Nama Kegiatan': presensi.kegiatan?.nama_kegiatan || '-',
        'Tanggal Kegiatan': presensi.kegiatan?.tanggal || '-',
        'Jam Mulai': presensi.kegiatan?.jam_mulai || '-',
        'Lokasi': presensi.kegiatan?.lokasi || '-',
        'Status Presensi': presensi.status,
        'Waktu Presensi': presensi.waktu_presensi ? formatDate(presensi.waktu_presensi) + ' ' + formatTime(presensi.waktu_presensi) : '-',
        'Alasan Izin': presensi.alasan_izin || '-',
        'Disetujui Oleh': presensi.approved_by || '-',
        'Waktu Disetujui': presensi.approved_at || '-'
      }));
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const columnWidths = [
        { wch: 20 }, // Nama Lengkap
        { wch: 15 }, // Kelompok
        { wch: 15 }, // Desa
        { wch: 12 }, // Jenis Kelamin
        { wch: 25 }, // Nama Kegiatan
        { wch: 15 }, // Tanggal Kegiatan
        { wch: 12 }, // Jam Mulai
        { wch: 20 }, // Lokasi
        { wch: 15 }, // Status Presensi
        { wch: 25 }, // Waktu Presensi
        { wch: 30 }, // Alasan Izin
        { wch: 15 }, // Disetujui Oleh
        { wch: 20 }  // Waktu Disetujui
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi Kegiatan');
      
      // Save Excel file
      XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export Excel berhasil');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal export Excel');
    }
  };

  const handleExportJPG = async () => {
    try {
      const html2canvas = require('html2canvas');
      
      // Get the table element
      const tableElement = document.querySelector('table');
      if (!tableElement) {
        toast.error('Tabel tidak ditemukan');
        return;
      }
      
      // Show loading
      toast.loading('Mengkonversi ke JPG...', { duration: 2000 });
      
      // Convert table to canvas
      const canvas = await html2canvas(tableElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `presensi-kegiatan-${new Date().toISOString().split('T')[0]}.jpg`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        toast.success('Export JPG berhasil');
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Error exporting JPG:', error);
      toast.error('Gagal export JPG');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-800';
      case 'terlambat': return 'bg-yellow-100 text-yellow-800';
      case 'izin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueValues = (field) => {
    const values = presensiList.map(presensi => presensi[field]).filter(Boolean);
    return [...new Set(values)];
  };

  const renderCalendarView = () => {
    return (
      <div className="mt-6">
        <CalendarView
          presensiList={presensiList}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDateClick={(date) => {
            const dateString = date.toISOString().split('T')[0];
            setFilters(prev => ({ ...prev, tanggal: dateString }));
            setViewMode('table');
          }}
        />
      </div>
    );
  };

  if (loading) return <DataLoadingSpinner />;

  return (
    <LayoutDashboard>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Riwayat Presensi Terintegrasi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Semua riwayat presensi dari berbagai kegiatan dalam satu tempat
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              {viewMode === 'table' ? '📅 Calendar View' : '📊 Table View'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700">
              Kegiatan
            </label>
            <select
              id="kegiatan"
              name="kegiatan"
              value={filters.kegiatan}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Semua Kegiatan</option>
              {kegiatanList.map(kegiatan => (
                <option key={kegiatan.id} value={kegiatan.id}>
                  {kegiatan.nama_kegiatan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="terlambat">Terlambat</option>
              <option value="izin">Izin</option>
            </select>
          </div>

          <div>
            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">
              Tanggal
            </label>
            <input
              type="date"
              id="tanggal"
              name="tanggal"
              value={filters.tanggal}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="kelompok" className="block text-sm font-medium text-gray-700">
              Kelompok
            </label>
            <select
              id="kelompok"
              name="kelompok"
              value={filters.kelompok}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Semua Kelompok</option>
              {getUniqueValues('kelompok').map(kelompok => (
                <option key={kelompok} value={kelompok}>{kelompok}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="desa" className="block text-sm font-medium text-gray-700">
              Desa
            </label>
            <select
              id="desa"
              name="desa"
              value={filters.desa}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Semua Desa</option>
              {getUniqueValues('desa').map(desa => (
                <option key={desa} value={desa}>{desa}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPresensi.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800">
                  {selectedPresensi.length} presensi dipilih
                </span>
                <button
                  onClick={() => setSelectedPresensi([])}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Hapus pilihan
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkExportPDF}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  📄 Export PDF
                </button>
                <button
                  onClick={handleBulkExportExcel}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  📊 Export Excel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleBulkExportPDF}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            📄 Export PDF Terpilih
          </button>
          <button
            onClick={handleBulkExportExcel}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            📊 Export Excel Terpilih
          </button>
          <button
            onClick={handleExportJPG}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            🖼️ Export JPG
          </button>
        </div>

        {/* Content */}
        {viewMode === 'calendar' ? (
          renderCalendarView()
        ) : (
          /* Table View */
          <>
            {/* Bulk Actions */}
            <BulkActions
              selectedItems={selectedPresensi}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExportPDF}
              itemType="presensi"
              showStatusChange={false}
            />
            
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="relative px-6 py-3">
                            <input
                              type="checkbox"
                              checked={selectedPresensi.length === presensiList.length && presensiList.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jenis Kegiatan
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal & Waktu
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lokasi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {presensiList.map((presensi) => (
                          <tr key={presensi.id} className="hover:bg-gray-50">
                            <td className="relative px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedPresensi.includes(presensi.id)}
                                onChange={() => handleSelectPresensi(presensi.id)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {presensi.nama_lengkap}
                              </div>
                              <div className="text-sm text-gray-500">
                                {presensi.kelompok} • {presensi.desa}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {presensi.kegiatan?.nama_kegiatan}
                              </div>
                              <div className="text-sm text-gray-500">
                                {presensi.kegiatan?.jam_mulai}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(presensi.waktu_presensi)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(presensi.waktu_presensi)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(presensi.status)}`}>
                                {presensi.status === 'hadir' ? 'Hadir' : 
                                 presensi.status === 'terlambat' ? 'Terlambat' : 'Izin'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {presensi.kegiatan?.lokasi}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {presensiList.length === 0 && viewMode === 'table' && (
          <div className="text-center py-12">
            <div className="text-gray-500">Tidak ada data presensi</div>
          </div>
        )}
      </div>
    </LayoutDashboard>
  );
} 
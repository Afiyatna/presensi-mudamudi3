import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { kegiatanService } from '../lib/kegiatanService';
import { presensiKegiatanService } from '../lib/presensiKegiatanService';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import TabNavigation from '../components/TabNavigation';
import KegiatanCard from '../components/KegiatanCard';
import DetailPresensiTable from '../components/DetailPresensiTable';
import StatistikKegiatan from '../components/StatistikKegiatan';
import KalenderKegiatan from '../components/KalenderKegiatan';
import { toast } from 'react-hot-toast';

export default function KegiatanAdmin() {
  const navigate = useNavigate();
  const [kegiatan, setKegiatan] = useState([]);
  const [presensiList, setPresensiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [activeTab, setActiveTab] = useState('daftar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    tanggal: '',
    jam_mulai: '',
    lokasi: '',
    deskripsi: '',
    status: 'aktif',
    kategori_kegiatan: 'Kelompok'
  });

  // Tab configuration
  const tabs = [
    { id: 'daftar', label: 'Daftar Kegiatan', count: kegiatan.length },
    { id: 'detail', label: 'Detail Presensi', count: selectedKegiatan ? presensiList.length : 0 },
    { id: 'statistik', label: 'Statistik', count: selectedKegiatan ? presensiList.length : 0 },
    { id: 'kalender', label: 'Kalender', count: kegiatan.length }
  ];

  useEffect(() => {
    fetchKegiatan();
    fetchAllPresensi();
  }, []);

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const { data, error } = await kegiatanService.getAllKegiatan();
      if (error) throw error;
      setKegiatan(data || []);
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      toast.error('Gagal memuat data kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPresensi = async () => {
    try {
      const { data, error } = await presensiKegiatanService.getAllPresensiKegiatan();
      if (error) throw error;
      setPresensiList(data || []);
    } catch (error) {
      console.error('Error fetching presensi:', error);
    }
  };

  const fetchPresensiByKegiatan = async (kegiatanId) => {
    try {
      const { data, error } = await presensiKegiatanService.getPresensiByKegiatan(kegiatanId);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching presensi by kegiatan:', error);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_kegiatan || !formData.tanggal || !formData.jam_mulai || !formData.lokasi || !formData.kategori_kegiatan) {
      toast.error('Semua field wajib diisi');
      return;
    }

    try {
      if (editingKegiatan) {
        // Update existing kegiatan
        const { error } = await kegiatanService.updateKegiatan(editingKegiatan.id, formData);
        if (error) throw error;
        toast.success('Kegiatan berhasil diupdate');
      } else {
        // Create new kegiatan
        const { error } = await kegiatanService.createKegiatan(formData);
        if (error) throw error;
        toast.success('Kegiatan berhasil ditambahkan');
      }
      
      setShowModal(false);
      setEditingKegiatan(null);
      resetForm();
      fetchKegiatan();
    } catch (error) {
      console.error('Error saving kegiatan:', error);
      toast.error('Gagal menyimpan kegiatan');
    }
  };

  const handleEdit = (kegiatan) => {
    setEditingKegiatan(kegiatan);
    setFormData({
      nama_kegiatan: kegiatan.nama_kegiatan,
      tanggal: kegiatan.tanggal,
      jam_mulai: kegiatan.jam_mulai,
      lokasi: kegiatan.lokasi,
      deskripsi: kegiatan.deskripsi || '',
      status: kegiatan.status,
      kategori_kegiatan: kegiatan.kategori_kegiatan || 'Kelompok'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;
    
    try {
      const { error } = await kegiatanService.deleteKegiatan(id);
      if (error) throw error;
      toast.success('Kegiatan berhasil dihapus');
      fetchKegiatan();
      
      // Reset selected kegiatan if deleted
      if (selectedKegiatan && selectedKegiatan.id === id) {
        setSelectedKegiatan(null);
        setActiveTab('daftar');
      }
    } catch (error) {
      console.error('Error deleting kegiatan:', error);
      toast.error('Gagal menghapus kegiatan');
    }
  };

  const handleScanner = (kegiatan) => {
    // Navigate to QR Scanner with kegiatan context
    navigate('/qr-scanner', { 
      state: { 
        kegiatanId: kegiatan.id, 
        kegiatanNama: kegiatan.nama_kegiatan,
        kategoriKegiatan: kegiatan.kategori_kegiatan || 'Kelompok'
      } 
    });
  };

  const handleKegiatanClick = async (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setActiveTab('detail');
    
    // Fetch presensi for this kegiatan
    const presensi = await fetchPresensiByKegiatan(kegiatan.id);
    setPresensiList(presensi);
  };

  const handleQrScanner = () => {
    if (selectedKegiatan) {
      handleScanner(selectedKegiatan);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Find kegiatan for selected date
    const kegiatanOnDate = kegiatan.find(k => 
      new Date(k.tanggal).toDateString() === date.toDateString()
    );
    if (kegiatanOnDate) {
      setSelectedKegiatan(kegiatanOnDate);
      setActiveTab('detail');
    }
  };

  const resetForm = () => {
    setFormData({
      nama_kegiatan: '',
      tanggal: '',
      jam_mulai: '',
      lokasi: '',
      deskripsi: '',
      status: 'aktif',
      kategori_kegiatan: 'Kelompok'
    });
  };

  const openAddModal = () => {
    setEditingKegiatan(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingKegiatan(null);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'selesai':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'dibatalkan':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'selesai':
        return 'Selesai';
      case 'dibatalkan':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <LayoutDashboard>
        <DataLoadingSpinner />
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manajemen Kegiatan
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Kelola kegiatan dan pantau presensi anggota
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Kegiatan
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabs={tabs} 
        />

        {/* Tab Content */}
        {activeTab === 'daftar' && (
          <div className="space-y-6">
            {/* Daftar Kegiatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kegiatan.map((item) => (
                <KegiatanCard
                  key={item.id}
                  kegiatan={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={handleKegiatanClick}
                />
              ))}
            </div>

            {/* Empty State */}
            {kegiatan.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Belum ada kegiatan
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Mulai dengan menambahkan kegiatan pertama Anda.
                </p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tambah Kegiatan
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'detail' && (
          <DetailPresensiTable
            presensiList={presensiList}
            kegiatan={selectedKegiatan}
            onQrScanner={handleQrScanner}
          />
        )}

        {activeTab === 'statistik' && (
          <StatistikKegiatan
            presensiList={presensiList}
            kegiatan={selectedKegiatan}
          />
        )}

        {activeTab === 'kalender' && (
          <KalenderKegiatan
            kegiatanList={kegiatan}
            presensiList={presensiList}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingKegiatan ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Kegiatan *
                    </label>
                    <input
                      type="text"
                      name="nama_kegiatan"
                      value={formData.nama_kegiatan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal *
                      </label>
                      <input
                        type="date"
                        name="tanggal"
                        value={formData.tanggal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jam Mulai *
                      </label>
                      <input
                        type="time"
                        name="jam_mulai"
                        value={formData.jam_mulai}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Kegiatan *
                    </label>
                    <select
                      name="kategori_kegiatan"
                      value={formData.kategori_kegiatan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="Daerah">Daerah</option>
                      <option value="Desa">Desa</option>
                      <option value="Kelompok">Kelompok</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {editingKegiatan ? 'Update' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutDashboard>
  );
} 
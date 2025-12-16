import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { kegiatanService } from '../lib/kegiatanService';
import { izinKegiatanService } from '../lib/izinKegiatanService';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import { toast } from 'react-hot-toast';

export default function KegiatanUser() {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [formData, setFormData] = useState({
    tanggal_izin: '',
    alasan: ''
  });
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchKegiatan();
    fetchUserProfile();
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

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitIzin = async (e) => {
    e.preventDefault();
    
    if (!formData.tanggal_izin || !formData.alasan) {
      toast.error('Semua field wajib diisi');
      return;
    }

    try {
      const izinData = {
        kegiatan_id: selectedKegiatan.id,
        user_id: userProfile.id,
        nama_lengkap: userProfile.nama_lengkap,
        tanggal_izin: formData.tanggal_izin,
        alasan: formData.alasan,
        status: 'pending'
      };

      const { error } = await izinKegiatanService.createIzin(izinData);
      if (error) throw error;
      
      toast.success('Permintaan izin berhasil dikirim');
      setShowModal(false);
      setSelectedKegiatan(null);
      resetForm();
    } catch (error) {
      console.error('Error creating izin:', error);
      toast.error('Gagal mengirim permintaan izin');
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal_izin: '',
      alasan: ''
    });
  };

  const openIzinModal = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedKegiatan(null);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'selesai': return 'bg-blue-100 text-blue-800';
      case 'dibatalkan': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <DataLoadingSpinner message="Memuat data kegiatan..." />;

  return (
    <LayoutDashboard pageTitle="Daftar Kegiatan">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Kegiatan</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Lihat kegiatan pengajian yang tersedia dan ajukan izin jika diperlukan
            </p>
          </div>
        </div>

        {/* Kegiatan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kegiatan.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                {/* Header Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.nama_kegiatan}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Info Kegiatan */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(item.tanggal)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.jam_mulai}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.lokasi}
                  </div>
                  {item.deskripsi && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="line-clamp-2">{item.deskripsi}</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openIzinModal(item)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ajukan Izin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {kegiatan.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Belum ada kegiatan</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Belum ada kegiatan yang tersedia saat ini.
            </p>
          </div>
        )}

        {/* Modal Form Izin */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Ajukan Izin Kegiatan
                </h3>
                
                {/* Info Kegiatan */}
                {selectedKegiatan && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {selectedKegiatan.nama_kegiatan}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(selectedKegiatan.tanggal)} • {selectedKegiatan.jam_mulai}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmitIzin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal Izin *
                    </label>
                    <input
                      type="date"
                      name="tanggal_izin"
                      value={formData.tanggal_izin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alasan Izin *
                    </label>
                    <textarea
                      name="alasan"
                      value={formData.alasan}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Jelaskan alasan Anda tidak bisa hadir..."
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Kirim Permintaan
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
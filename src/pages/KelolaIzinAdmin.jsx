import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { izinKegiatanService } from '../lib/izinKegiatanService';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import BulkActions from '../components/BulkActions';
import { toast } from 'react-hot-toast';

export default function KelolaIzinAdmin() {
  const [izinList, setIzinList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIzin, setSelectedIzin] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    kegiatan: '',
    tanggal: ''
  });
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchIzinList();
  }, [filters]);

  const fetchIzinList = async () => {
    try {
      setLoading(true);
      let { data, error } = await izinKegiatanService.getAllIzinKegiatan();
      
      if (error) throw error;
      
      // Apply filters
      if (filters.status) {
        data = data.filter(izin => izin.status === filters.status);
      }
      if (filters.kegiatan) {
        data = data.filter(izin => izin.kegiatan?.nama_kegiatan?.toLowerCase().includes(filters.kegiatan.toLowerCase()));
      }
      if (filters.tanggal) {
        data = data.filter(izin => izin.tanggal_izin === filters.tanggal);
      }
      
      setIzinList(data || []);
    } catch (error) {
      console.error('Error fetching izin list:', error);
      toast.error('Gagal memuat data izin');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectIzin = (izinId) => {
    setSelectedIzin(prev => {
      if (prev.includes(izinId)) {
        return prev.filter(id => id !== izinId);
      } else {
        return [...prev, izinId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIzin.length === izinList.length) {
      setSelectedIzin([]);
    } else {
      setSelectedIzin(izinList.map(izin => izin.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIzin.length === 0) {
      toast.error('Pilih izin yang akan disetujui');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await izinKegiatanService.bulkApproveIzin(selectedIzin, user.id);
      if (error) throw error;

      toast.success(`${selectedIzin.length} izin berhasil disetujui`);
      setSelectedIzin([]);
      fetchIzinList();
    } catch (error) {
      console.error('Error bulk approving izin:', error);
      toast.error('Gagal menyetujui izin');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIzin.length === 0) {
      toast.error('Pilih izin yang akan ditolak');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await izinKegiatanService.bulkRejectIzin(selectedIzin, user.id);
      if (error) throw error;

      toast.success(`${selectedIzin.length} izin berhasil ditolak`);
      setSelectedIzin([]);
      fetchIzinList();
    } catch (error) {
      console.error('Error bulk rejecting izin:', error);
      toast.error('Gagal menolak izin');
    }
  };

  const handleApprove = async (izinId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await izinKegiatanService.approveIzin(izinId, user.id);
      if (error) throw error;

      toast.success('Izin berhasil disetujui');
      fetchIzinList();
    } catch (error) {
      console.error('Error approving izin:', error);
      toast.error('Gagal menyetujui izin');
    }
  };

  const handleReject = async (izinId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await izinKegiatanService.rejectIzin(izinId, user.id);
      if (error) throw error;

      toast.success('Izin berhasil ditolak');
      fetchIzinList();
    } catch (error) {
      console.error('Error rejecting izin:', error);
      toast.error('Gagal menolak izin');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  if (loading) return <DataLoadingSpinner />;

  return (
    <LayoutDashboard>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Kelola Izin Kegiatan</h1>
            <p className="mt-2 text-sm text-gray-700">
              Kelola semua permintaan izin kegiatan dari user
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <option value="pending">Pending</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          <div>
            <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700">
              Nama Kegiatan
            </label>
            <input
              type="text"
              id="kegiatan"
              name="kegiatan"
              value={filters.kegiatan}
              onChange={handleFilterChange}
              placeholder="Cari kegiatan..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">
              Tanggal Izin
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
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedItems={selectedIzin}
          onBulkDelete={() => {}} // Not implemented for izin
          onBulkExport={() => {}} // Not implemented for izin
          onBulkStatusChange={async (ids, newStatus) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('User not authenticated');

              if (newStatus === 'approved') {
                await izinKegiatanService.bulkApproveIzin(ids, user.id);
              } else if (newStatus === 'rejected') {
                await izinKegiatanService.bulkRejectIzin(ids, user.id);
              }
              
              setSelectedIzin([]);
              fetchIzinList();
            } catch (error) {
              throw error;
            }
          }}
          itemType="izin"
          showStatusChange={true}
          statusOptions={[
            { value: 'approved', label: 'Disetujui' },
            { value: 'rejected', label: 'Ditolak' }
          ]}
        />

        {/* Izin List */}
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
                          checked={selectedIzin.length === izinList.length && izinList.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kegiatan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Izin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alasan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {izinList.map((izin) => (
                      <tr key={izin.id} className="hover:bg-gray-50">
                        <td className="relative px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIzin.includes(izin.id)}
                            onChange={() => handleSelectIzin(izin.id)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {izin.nama_lengkap}
                          </div>
                          <div className="text-sm text-gray-500">
                            {izin.user?.kelompok} • {izin.user?.desa}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {izin.kegiatan?.nama_kegiatan}
                          </div>
                          <div className="text-sm text-gray-500">
                            {izin.kegiatan?.lokasi}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(izin.tanggal_izin)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {izin.alasan}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(izin.status)}`}>
                            {izin.status === 'pending' ? 'Menunggu' : 
                             izin.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {izin.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(izin.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleReject(izin.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Tolak
                              </button>
                            </div>
                          )}
                          {izin.status !== 'pending' && (
                            <span className="text-gray-500">
                              {izin.approved_by ? `Oleh: ${izin.approver?.nama_lengkap}` : '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {izinList.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">Tidak ada data izin</div>
          </div>
        )}
      </div>
    </LayoutDashboard>
  );
} 
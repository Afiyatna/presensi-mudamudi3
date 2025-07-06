import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import LayoutDashboard from '../layouts/LayoutDashboard';

export default function UserPresensiHistory() {
  const [presensi, setPresensi] = useState([]);
  const [filteredPresensi, setFilteredPresensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchPresensi = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }
      // Ambil nama_lengkap user dari profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('nama_lengkap')
        .eq('id', userData.user.id)
        .single();
      if (!profile) {
        setLoading(false);
        return;
      }
      setNamaLengkap(profile.nama_lengkap);
      // Ambil presensi dari tiga tabel
      const [presensiUmum, presensiDaerah, presensiDesa] = await Promise.all([
        supabase.from('presensi').select('*').eq('nama_lengkap', profile.nama_lengkap),
        supabase.from('presensi_daerah').select('*').eq('nama_lengkap', profile.nama_lengkap),
        supabase.from('presensi_desa').select('*').eq('nama_lengkap', profile.nama_lengkap),
      ]);
      // Mapping dan tambahkan jenis_presensi
      const dataUmum = (presensiUmum.data || []).map(row => ({
        ...row,
        jenis_presensi: 'Presensi Umum',
        waktu_presensi: row.waktu_presensi,
      }));
      const dataDaerah = (presensiDaerah.data || []).map(row => ({
        ...row,
        jenis_presensi: 'Presensi Daerah',
        waktu_presensi: row.waktu_presensi,
      }));
      const dataDesa = (presensiDesa.data || []).map(row => ({
        ...row,
        jenis_presensi: 'Presensi Desa',
        waktu_presensi: row.waktu_presensi,
      }));
      // Gabungkan dan urutkan berdasarkan waktu_presensi terbaru
      const allData = [...dataUmum, ...dataDaerah, ...dataDesa].sort((a, b) => new Date(b.waktu_presensi) - new Date(a.waktu_presensi));
      setPresensi(allData);
      setLoading(false);
    };
    fetchPresensi();
  }, []);

  useEffect(() => {
    let filtered = presensi;
    if (filterJenis) {
      filtered = filtered.filter(row => row.jenis_presensi === filterJenis);
    }
    if (filterTanggal) {
      filtered = filtered.filter(row => row.waktu_presensi && row.waktu_presensi.startsWith(filterTanggal));
    }
    if (filterStatus) {
      filtered = filtered.filter(row => row.status === filterStatus);
    }
    setFilteredPresensi(filtered);
  }, [presensi, filterJenis, filterTanggal, filterStatus]);

  // Untuk dropdown Jenis Presensi dan Status
  const jenisOptions = ['Presensi Umum', 'Presensi Daerah', 'Presensi Desa'];
  const statusOptions = ['hadir', 'terlambat'];

  if (loading) {
    return (
      <LayoutDashboard pageTitle="Riwayat Presensi">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Memuat data...</span>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard pageTitle="Riwayat Presensi">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Riwayat Presensi Anda</h2>
          <div className="mb-6 text-gray-600 dark:text-gray-300 text-lg font-medium">
            Nama: <span className="font-bold text-gray-900 dark:text-white">{namaLengkap}</span>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Presensi</label>
              <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="form-select w-full">
                <option value="">Semua</option>
                {jenisOptions.map(jenis => (
                  <option key={jenis} value={jenis}>{jenis}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal</label>
              <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select w-full">
                <option value="">Semua</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setFilterJenis(''); setFilterTanggal(''); setFilterStatus(''); }} className="btn bg-gray-500 hover:bg-gray-600 text-white w-full">Reset Filter</button>
            </div>
          </div>

          {filteredPresensi.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada data presensi.</p>
            </div>
          ) : (
            <>
              {/* Table View - Tampil di semua ukuran layar */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tanggal & Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Jenis Presensi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kelompok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Desa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPresensi.map((row) => (
                      <tr key={row.id + row.jenis_presensi} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(row.waktu_presensi).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {row.jenis_presensi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {row.kelompok}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {row.desa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'hadir' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : row.status === 'terlambat'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
} 
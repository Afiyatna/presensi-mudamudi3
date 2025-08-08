import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

export default function DataProfileUser() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  // Tambah state filter
  const [filters, setFilters] = useState({ jenis_kelamin: 'Semua', kelompok: 'Semua', desa: 'Semua', search: '' });

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error) setProfiles(data || []);
      setLoading(false);
    };
    fetchProfiles();
    // Ambil role admin
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      if (profile?.role) setRole(profile.role);
    };
    fetchRole();
  }, []);

  // Opsi unik dari data
  const jenisKelaminOptions = useMemo(
    () => Array.from(new Set((profiles || []).map(p => p?.jenis_kelamin).filter(Boolean))),
    [profiles]
  );
  const kelompokOptions = useMemo(
    () => Array.from(new Set((profiles || []).map(p => p?.kelompok).filter(Boolean))),
    [profiles]
  );
  const desaOptions = useMemo(
    () => Array.from(new Set((profiles || []).map(p => p?.desa).filter(Boolean))),
    [profiles]
  );

  // Data terfilter
  const filteredProfiles = useMemo(() => {
    const search = (filters.search || '').toLowerCase();
    return (profiles || []).filter(p => {
      const matchGender = filters.jenis_kelamin === 'Semua' || (p?.jenis_kelamin || '') === filters.jenis_kelamin;
      const matchKelompok = filters.kelompok === 'Semua' || (p?.kelompok || '') === filters.kelompok;
      const matchDesa = filters.desa === 'Semua' || (p?.desa || '') === filters.desa;
      const matchSearch = !search || (p?.nama_lengkap || '').toLowerCase().includes(search);
      return matchGender && matchKelompok && matchDesa && matchSearch;
    });
  }, [profiles, filters]);

  // Handler reset
  const handleResetFilters = () => {
    setFilters({ jenis_kelamin: 'Semua', kelompok: 'Semua', desa: 'Semua', search: '' });
  };

  return (
    <LayoutDashboard pageTitle="Data Profile User">
      <div className="p-4 pb-32 min-h-screen flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Data Profile User</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-justify">
          Halaman ini menampilkan data lengkap semua pengguna yang terdaftar dalam sistem presensi.
          Sebagai administrator, Anda dapat melihat informasi detail setiap peserta termasuk data pribadi,
          kelompok pengajian, dan desa asal. Data ini berguna untuk monitoring dan pengelolaan peserta.
        </p>
        {loading ? (
          <DataLoadingSpinner message="Memuat data profile user..." />
        ) : (
          <div className="overflow-x-auto flex-1">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/60">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Total Pengguna:</strong> {profiles.length} &nbsp;|&nbsp; <strong>Terfilter:</strong> {filteredProfiles.length}
              </p>
            </div>

            {/* Filter Panel */}
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Jenis Kelamin */}
                <div>
                  <label htmlFor="filter-jenis-kelamin" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    id="filter-jenis-kelamin"
                    aria-label="Filter berdasarkan jenis kelamin"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.jenis_kelamin}
                    onChange={(e) => setFilters(prev => ({ ...prev, jenis_kelamin: e.target.value }))}
                  >
                    <option value="Semua">Semua</option>
                    {jenisKelaminOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {/* Kelompok */}
                <div>
                  <label htmlFor="filter-kelompok" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Kelompok
                  </label>
                  <select
                    id="filter-kelompok"
                    aria-label="Filter berdasarkan kelompok"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.kelompok}
                    onChange={(e) => setFilters(prev => ({ ...prev, kelompok: e.target.value }))}
                  >
                    <option value="Semua">Semua</option>
                    {kelompokOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {/* Desa */}
                <div>
                  <label htmlFor="filter-desa" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Desa
                  </label>
                  <select
                    id="filter-desa"
                    aria-label="Filter berdasarkan desa"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.desa}
                    onChange={(e) => setFilters(prev => ({ ...prev, desa: e.target.value }))}
                  >
                    <option value="Semua">Semua</option>
                    {desaOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {/* Search */}
                <div>
                  <label htmlFor="filter-search" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Cari Nama
                  </label>
                  <input
                    id="filter-search"
                    type="text"
                    placeholder="Cari nama peserta..."
                    aria-label="Cari nama peserta"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600 dark:text-gray-300">Menampilkan {filteredProfiles.length} dari {profiles.length} pengguna</span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" aria-label="Tabel data profile user">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
                  <th className="px-4 py-2 border dark:border-gray-700">Nama Lengkap</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Email</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Jenis Kelamin</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Tempat Lahir</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Tanggal Lahir</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Kelompok</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Desa</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.nama_lengkap}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.email}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.jenis_kelamin}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.tempat_lahir}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.tanggal_lahir}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.kelompok}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.desa}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {role === 'admin' && <BottomNavigation role="admin" />}
      </div>
    </LayoutDashboard>
  );
} 
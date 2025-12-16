import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';

export default function DataProfileUser() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, user: null });
  const qrRef = useRef(null);
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

  const getSafeFileName = (name, ext) => {
    if (!name) return `qr-code.${ext}`;
    return `${name.replace(/\s+/g, '_')}_qr-code.${ext}`;
  };

  const truncateLabel = (text, max = 25) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max - 3)}...` : text;
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const composeQrCard = (user) => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) return null;
    const cardWidth = 360;
    const cardHeight = 500;
    const qrSize = 220;
    const topPadding = 32;
    const gapAfterQr = 28;

    const canvas = document.createElement('canvas');
    canvas.width = cardWidth;
    canvas.height = cardHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cardWidth, cardHeight);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, cardWidth - 20, cardHeight - 20);

    const qrX = (cardWidth - qrSize) / 2;
    ctx.drawImage(qrCanvas, qrX, topPadding, qrSize, qrSize);

    const boxWidth = cardWidth - 80;
    const boxHeight = 40;
    const textStartY = topPadding + qrSize + gapAfterQr;
    const center = cardWidth / 2;
    ctx.textAlign = 'center';

    // Nama box
    const nameBoxX = (cardWidth - boxWidth) / 2;
    const nameBoxY = textStartY - boxHeight / 2;
    drawRoundedRect(ctx, nameBoxX, nameBoxY, boxWidth, boxHeight, 10);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillText(truncateLabel(user?.nama_lengkap || 'Nama belum diisi', 28), center, nameBoxY + boxHeight / 2 + 5);

    // Kelompok box
    const groupBoxY = nameBoxY + boxHeight + 12;
    drawRoundedRect(ctx, nameBoxX, groupBoxY, boxWidth, boxHeight, 10);
    ctx.fillStyle = '#eef2ff';
    ctx.fill();
    ctx.strokeStyle = '#c7d2fe';
    ctx.stroke();
    ctx.fillStyle = '#4f46e5';
    ctx.font = '14px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillText(truncateLabel(user?.kelompok || 'Belum ada kelompok'), center, groupBoxY + boxHeight / 2 + 4);

    return canvas;
  };

  const handleDownloadJpg = () => {
    if (!qrModal.user) return;
    const canvas = composeQrCard(qrModal.user);
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = url;
    link.download = getSafeFileName(qrModal.user.nama_lengkap, 'jpg');
    link.click();
  };

  const handleDownloadPdf = () => {
    if (!qrModal.user) return;
    const canvas = composeQrCard(qrModal.user);
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/jpeg');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [canvas.width + 40, canvas.height + 80] });
    pdf.text('QR Code Pengguna', 20, 30);
    pdf.addImage(imgData, 'JPEG', 20, 50, canvas.width, canvas.height);
    pdf.text(`Nama: ${qrModal.user.nama_lengkap || '-'}`, 20, 60 + canvas.height);
    pdf.text(`Kelompok: ${qrModal.user.kelompok || '-'}`, 20, 80 + canvas.height);
    pdf.save(getSafeFileName(qrModal.user.nama_lengkap, 'pdf'));
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
                  <th className="px-4 py-2 border dark:border-gray-700 text-center">QR</th>
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
                    <td className="px-4 py-2 border dark:border-gray-700 text-center">
                      <button
                        onClick={() => setQrModal({ open: true, user: profile })}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        aria-label={`Lihat QR untuk ${profile.nama_lengkap}`}
                      >
                        Lihat QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {role === 'admin' && <BottomNavigation role="admin" />}
      </div>

      {qrModal.open && qrModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setQrModal({ open: false, user: null })} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">QR Code Pengguna</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{qrModal.user.email}</p>
              </div>
              <button
                onClick={() => setQrModal({ open: false, user: null })}
                aria-label="Tutup modal QR"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center mb-5">
              <div ref={qrRef} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <QRCodeCanvas value={qrModal.user.id} size={240} />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{qrModal.user.nama_lengkap || 'Nama belum diisi'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kelompok</p>
                <p className="text-base font-medium text-indigo-600 dark:text-indigo-300">{qrModal.user.kelompok || 'Belum ada kelompok'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadJpg}
                className="w-full bg-violet-600 text-white px-4 py-2.5 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Download JPG
              </button>
              <button
                onClick={handleDownloadPdf}
                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
} 
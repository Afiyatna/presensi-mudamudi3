import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function DataProfileUser() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, user: null });
  const qrRef = useRef(null);
  // Tambah state filter
  const [filters, setFilters] = useState({ jenis_kelamin: 'Semua', kelompok: 'Semua', desa: 'Semua', kategori: 'Semua', search: '' });
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingFiltered, setDownloadingFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editCategoryModal, setEditCategoryModal] = useState({ open: false, user: null, newCategory: '' });

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
  const kategoriOptions = useMemo(
    () => Array.from(new Set((profiles || []).map(p => p?.kategori).filter(Boolean))),
    [profiles]
  );

  // Data terfilter
  const filteredProfiles = useMemo(() => {
    const search = (filters.search || '').toLowerCase();
    return (profiles || []).filter(p => {
      const matchGender = filters.jenis_kelamin === 'Semua' || (p?.jenis_kelamin || '') === filters.jenis_kelamin;
      const matchKelompok = filters.kelompok === 'Semua' || (p?.kelompok || '') === filters.kelompok;
      const matchDesa = filters.desa === 'Semua' || (p?.desa || '') === filters.desa;
      const matchKategori = filters.kategori === 'Semua' || (p?.kategori || '') === filters.kategori;
      const matchSearch = !search || (p?.nama_lengkap || '').toLowerCase().includes(search);
      return matchGender && matchKelompok && matchDesa && matchKategori && matchSearch;
    });
  }, [profiles, filters]);

  // Pagination logic
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProfiles.slice(indexOfFirstItem, indexOfLastItem);

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handler reset
  const handleResetFilters = () => {
    setFilters({ jenis_kelamin: 'Semua', kelompok: 'Semua', desa: 'Semua', kategori: 'Semua', search: '' });
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${userName}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_user_account', { user_id: userId });
      if (error) throw error;

      toast.success(`User ${userName} berhasil dihapus`);
      // Refresh data
      const { data, error: fetchError } = await supabase.from('profiles').select('*');
      if (!fetchError) setProfiles(data || []);

    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Gagal menghapus user: ${error.message}`);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryModal.user || !editCategoryModal.newCategory) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kategori: editCategoryModal.newCategory })
        .eq('id', editCategoryModal.user.id);

      if (error) throw error;

      toast.success(`Kategori ${editCategoryModal.user.nama_lengkap} berhasil diperbarui`);

      // Update local state
      setProfiles(prev => prev.map(p =>
        p.id === editCategoryModal.user.id ? { ...p, kategori: editCategoryModal.newCategory } : p
      ));

      setEditCategoryModal({ open: false, user: null, newCategory: '' });
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(`Gagal memperbarui kategori: ${error.message}`);
    }
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
    const cardHeight = 360;
    const qrSize = 140; // Reduced further from 180
    const topPadding = 40; // Increased padding
    const gapAfterQr = 30;

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

    // Text Configuration
    const boxWidth = cardWidth - 40; // Widened width (20px margin each side)
    const boxHeight = 36; // Reduced height (tighter fit for text)
    const textStartY = topPadding + qrSize + gapAfterQr;
    const center = cardWidth / 2;
    ctx.textAlign = 'center';

    // Nama box
    const nameBoxX = (cardWidth - boxWidth) / 2;
    const nameBoxY = textStartY;
    drawRoundedRect(ctx, nameBoxX, nameBoxY, boxWidth, boxHeight, 8); // Slightly smaller radius
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText(truncateLabel(user?.nama_lengkap || 'Nama belum diisi', 25), center, nameBoxY + boxHeight / 2 + 8);

    // Kelompok box
    const groupBoxY = nameBoxY + boxHeight + 8; // Tighter gap
    drawRoundedRect(ctx, nameBoxX, groupBoxY, boxWidth, boxHeight, 8);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    ctx.fillStyle = '#111827'; // Black text
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(truncateLabel(user?.kelompok || 'Belum ada kelompok'), center, groupBoxY + boxHeight / 2 + 7);

    // Kategori box
    const categoryBoxY = groupBoxY + boxHeight + 8; // Tighter gap
    drawRoundedRect(ctx, nameBoxX, categoryBoxY, boxWidth, boxHeight, 8);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    ctx.fillStyle = '#111827'; // Black text
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(truncateLabel(user?.kategori || 'Kategori tidak ada'), center, categoryBoxY + boxHeight / 2 + 7);

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
    pdf.text(`Kategori: ${qrModal.user.kategori || '-'}`, 20, 100 + canvas.height);
    pdf.save(getSafeFileName(qrModal.user.nama_lengkap, 'pdf'));
  };

  // Generate QR code card untuk user tertentu (tanpa DOM)
  const generateQrCardForUser = async (user) => {
    try {
      // Format QR code: userId|nama|kelompok|desa|kategori
      const qrValue = `${user.id}|${user.nama_lengkap || ''}|${user.kelompok || ''}|${user.desa || ''}|${user.kategori || ''}`;

      // Generate QR code sebagai data URL
      const qrDataUrl = await QRCode.toDataURL(qrValue, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create canvas untuk card
      const cardWidth = 360;
      const cardHeight = 360;
      const qrSize = 140; // Reduced
      const topPadding = 40;
      const gapAfterQr = 30;

      const canvas = document.createElement('canvas');
      const scale = 6; // Ultra High resolution scale (Full HD++)
      canvas.width = cardWidth * scale;
      canvas.height = cardHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale); // Scale all drawing operations

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, cardWidth - 20, cardHeight - 20);

      // Load QR code image
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataUrl;
      });

      // Draw QR code
      const qrX = (cardWidth - qrSize) / 2;
      ctx.drawImage(qrImage, qrX, topPadding, qrSize, qrSize);

      // Text boxes
      // Text boxes
      const boxWidth = cardWidth - 40; // Widened width
      const boxHeight = 36; // Reduced height
      const textStartY = topPadding + qrSize + gapAfterQr;
      const center = cardWidth / 2;
      ctx.textAlign = 'center';

      // Nama box
      const nameBoxX = (cardWidth - boxWidth) / 2;
      const nameBoxY = textStartY;
      drawRoundedRect(ctx, nameBoxX, nameBoxY, boxWidth, boxHeight, 8);
      ctx.fillStyle = '#f9fafb';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText(truncateLabel(user?.nama_lengkap || 'Nama belum diisi', 25), center, nameBoxY + boxHeight / 2 + 8);

      // Kelompok box
      const groupBoxY = nameBoxY + boxHeight + 8; // Tighter gap
      drawRoundedRect(ctx, nameBoxX, groupBoxY, boxWidth, boxHeight, 8);
      ctx.fillStyle = '#f9fafb';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();
      ctx.fillStyle = '#111827'; // Black text
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText(truncateLabel(user?.kelompok || 'Belum ada kelompok'), center, groupBoxY + boxHeight / 2 + 7);

      // Kategori box
      const categoryBoxY = groupBoxY + boxHeight + 8; // Tighter gap
      drawRoundedRect(ctx, nameBoxX, categoryBoxY, boxWidth, boxHeight, 8);
      ctx.fillStyle = '#f9fafb';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();
      ctx.fillStyle = '#111827'; // Black text
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText(truncateLabel(user?.kategori || 'Kategori tidak ada'), center, categoryBoxY + boxHeight / 2 + 7);

      return canvas;
    } catch (error) {
      console.error('Error generating QR card for user:', user?.nama_lengkap, error);
      return null;
    }
  };

  // Download semua QR code dalam format ZIP
  const handleDownloadAllQRCodes = async () => {
    if (profiles.length === 0) {
      toast.error('Tidak ada data pengguna untuk didownload');
      return;
    }

    setDownloadingAll(true);
    toast.loading('Membuat QR code untuk semua pengguna...', { id: 'download-all' });

    try {
      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      // Process users in batches to avoid memory issues
      const batchSize = 10;
      const totalBatches = Math.ceil(profiles.length / batchSize);

      for (let i = 0; i < profiles.length; i += batchSize) {
        const batch = profiles.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        toast.loading(
          `Memproses batch ${batchNumber}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, profiles.length)} dari ${profiles.length})...`,
          { id: 'download-all' }
        );

        // Process batch
        const promises = batch.map(async (user) => {
          try {
            const canvas = await generateQrCardForUser(user);
            if (canvas) {
              // Convert canvas to blob
              const blob = await new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
              });

              if (blob) {
                const fileName = getSafeFileName(user.nama_lengkap || `user_${user.id}`, 'jpg');
                zip.file(fileName, blob);
                successCount++;
              } else {
                failCount++;
              }
            } else {
              failCount++;
            }
          } catch (error) {
            console.error(`Error processing user ${user.nama_lengkap}:`, error);
            failCount++;
          }
        });

        await Promise.all(promises);
      }

      if (successCount === 0) {
        toast.error('Gagal membuat QR code. Silakan coba lagi.', { id: 'download-all' });
        setDownloadingAll(false);
        return;
      }

      toast.loading('Membuat file ZIP...', { id: 'download-all' });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `semua_qr_code_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Download berhasil! ${successCount} QR code${failCount > 0 ? ` (${failCount} gagal)` : ''}`,
        { id: 'download-all' }
      );
    } catch (error) {
      console.error('Error downloading all QR codes:', error);
      toast.error('Gagal membuat file ZIP. Silakan coba lagi.', { id: 'download-all' });
    } finally {
      setDownloadingAll(false);
    }
  };

  // Download QR code berdasarkan filter yang diterapkan
  const handleDownloadFilteredQRCodes = async () => {
    if (filteredProfiles.length === 0) {
      toast.error('Tidak ada data pengguna yang sesuai dengan filter untuk didownload');
      return;
    }

    setDownloadingFiltered(true);

    // Generate nama file berdasarkan filter
    const filterParts = [];
    if (filters.kelompok !== 'Semua') filterParts.push(`Kelompok_${filters.kelompok.replace(/\s+/g, '_')}`);
    if (filters.desa !== 'Semua') filterParts.push(`Desa_${filters.desa.replace(/\s+/g, '_')}`);
    if (filters.kategori !== 'Semua') filterParts.push(`Kategori_${filters.kategori.replace(/\s+/g, '_')}`);
    if (filters.jenis_kelamin !== 'Semua') filterParts.push(filters.jenis_kelamin.replace(/\s+/g, '_'));
    if (filters.search) filterParts.push(`Search_${filters.search.replace(/\s+/g, '_')}`);

    const fileNamePrefix = filterParts.length > 0
      ? filterParts.join('_')
      : 'Filtered';

    toast.loading(`Membuat QR code untuk ${filteredProfiles.length} pengguna...`, { id: 'download-filtered' });

    try {
      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      // Process users in batches to avoid memory issues
      const batchSize = 10;
      const totalBatches = Math.ceil(filteredProfiles.length / batchSize);

      for (let i = 0; i < filteredProfiles.length; i += batchSize) {
        const batch = filteredProfiles.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        toast.loading(
          `Memproses batch ${batchNumber}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, filteredProfiles.length)} dari ${filteredProfiles.length})...`,
          { id: 'download-filtered' }
        );

        // Process batch
        const promises = batch.map(async (user) => {
          try {
            const canvas = await generateQrCardForUser(user);
            if (canvas) {
              // Convert canvas to blob
              const blob = await new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
              });

              if (blob) {
                const fileName = getSafeFileName(user.nama_lengkap || `user_${user.id}`, 'jpg');
                zip.file(fileName, blob);
                successCount++;
              } else {
                failCount++;
              }
            } else {
              failCount++;
            }
          } catch (error) {
            console.error(`Error processing user ${user.nama_lengkap}:`, error);
            failCount++;
          }
        });

        await Promise.all(promises);
      }

      if (successCount === 0) {
        toast.error('Gagal membuat QR code. Silakan coba lagi.', { id: 'download-filtered' });
        setDownloadingFiltered(false);
        return;
      }

      toast.loading('Membuat file ZIP...', { id: 'download-filtered' });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_code_${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Download berhasil! ${successCount} QR code${failCount > 0 ? ` (${failCount} gagal)` : ''}`,
        { id: 'download-filtered' }
      );
    } catch (error) {
      console.error('Error downloading filtered QR codes:', error);
      toast.error('Gagal membuat file ZIP. Silakan coba lagi.', { id: 'download-filtered' });
    } finally {
      setDownloadingFiltered(false);
    }
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  <strong>Total Pengguna:</strong> {profiles.length} &nbsp;|&nbsp; <strong>Terfilter:</strong> {filteredProfiles.length}
                </p>
                {role === 'admin' && (
                  <button
                    onClick={handleDownloadAllQRCodes}
                    disabled={downloadingAll || profiles.length === 0}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {downloadingAll ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Semua QR Code
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
                {/* Kategori */}
                <div>
                  <label htmlFor="filter-kategori" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    id="filter-kategori"
                    aria-label="Filter berdasarkan kategori"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.kategori}
                    onChange={(e) => setFilters(prev => ({ ...prev, kategori: e.target.value }))}
                  >
                    <option value="Semua">Semua</option>
                    {kategoriOptions.map((opt) => (
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
                <div className="flex items-center gap-2">
                  {role === 'admin' && filteredProfiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadFilteredQRCodes}
                      disabled={downloadingFiltered}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                    >
                      {downloadingFiltered ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download QR Code ({filteredProfiles.length})
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
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
                  <th className="px-4 py-2 border dark:border-gray-700">Kategori</th>
                  <th className="px-4 py-2 border dark:border-gray-700">Role</th>
                  <th className="px-4 py-2 border dark:border-gray-700 text-center">Aksi</th>
                  <th className="px-4 py-2 border dark:border-gray-700 text-center">QR</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((profile) => (
                  <tr key={profile.id} className="text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.nama_lengkap}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.email}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.jenis_kelamin}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.tempat_lahir}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.tanggal_lahir}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.kelompok}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.desa}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.kategori || '-'}</td>
                    <td className="px-4 py-2 border dark:border-gray-700">{profile.role}</td>
                    <td className="px-4 py-2 border dark:border-gray-700 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <button
                          onClick={() => setEditCategoryModal({ open: true, user: profile, newCategory: profile.kategori || '' })}
                          className="w-full text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id, profile.nama_lengkap)}
                          className="w-full text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
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

        {filteredProfiles.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProfiles.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          />
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
                <QRCodeCanvas
                  value={`${qrModal.user.id}|${qrModal.user.nama_lengkap || ''}|${qrModal.user.kelompok || ''}|${qrModal.user.desa || ''}|${qrModal.user.kategori || ''}`}
                  size={240}
                />
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
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kategori</p>
                <p className="text-base font-medium text-pink-600 dark:text-pink-300">{qrModal.user.kategori || '-'}</p>
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

      {/* Edit Category Modal */}
      {editCategoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditCategoryModal({ open: false, user: null, newCategory: '' })} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Kategori User</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-justify">
              Ubah kategori untuk <b>{editCategoryModal.user?.nama_lengkap}</b>.
              Pastikan kategori yang dipilih sudah sesuai dengan status user tersebut.
            </p>
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Kategori Baru</label>
                <select
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editCategoryModal.newCategory}
                  onChange={(e) => setEditCategoryModal(prev => ({ ...prev, newCategory: e.target.value }))}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Muda - Mudi">Muda - Mudi</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Pengurus">Pengurus</option>
                  <option value="Guru Pondok">Guru Pondok</option>
                  <option value="MT">MT</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setEditCategoryModal({ open: false, user: null, newCategory: '' })}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
} 
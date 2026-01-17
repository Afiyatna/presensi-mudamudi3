import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Pagination from './Pagination';

const DetailPresensiTable = ({ presensiList, kegiatan, onQrScanner }) => {
    const [filterStatus, setFilterStatus] = useState('semua');
    const [filterKelompok, setFilterKelompok] = useState('semua');
    const [filterDesa, setFilterDesa] = useState('semua');
    const [filterKategori, setFilterKategori] = useState('semua');
    const [filterJenisKelamin, setFilterJenisKelamin] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get unique values for filters
    const kelompokOptions = useMemo(() => {
        const options = [...new Set(presensiList.map(p => p.kelompok).filter(Boolean))];
        return options;
    }, [presensiList]);

    const desaOptions = useMemo(() => {
        const options = [...new Set(presensiList.map(p => p.desa).filter(Boolean))];
        return options;
    }, [presensiList]);

    const kategoriOptions = useMemo(() => {
        const options = [...new Set(presensiList.map(p => p.user?.kategori).filter(Boolean))];
        return options;
    }, [presensiList]);

    // Filter data
    const filteredPresensi = useMemo(() => {
        return presensiList.filter(presensi => {
            const matchStatus = filterStatus === 'semua' || presensi.status === filterStatus;
            const matchKelompok = filterKelompok === 'semua' || presensi.kelompok === filterKelompok;
            const matchDesa = filterDesa === 'semua' || presensi.desa === filterDesa;
            const matchKategori = filterKategori === 'semua' || presensi.user?.kategori === filterKategori;
            const matchJenisKelamin = filterJenisKelamin === 'semua' || presensi.jenis_kelamin === filterJenisKelamin;
            const matchSearch = presensi.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                presensi.kelompok?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                presensi.desa?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchStatus && matchKelompok && matchDesa && matchKategori && matchJenisKelamin && matchSearch;
        });
    }, [presensiList, filterStatus, filterKelompok, filterDesa, filterKategori, filterJenisKelamin, searchQuery]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPresensi.slice(indexOfFirstItem, indexOfLastItem);

    const onPageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'hadir':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'terlambat':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'izin':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'hadir':
                return 'Hadir';
            case 'terlambat':
                return 'Terlambat';
            case 'izin':
                return 'Izin';
            default:
                return status;
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        try {
            const date = new Date(dateTimeString);
            return format(date, 'dd/MM/yyyy HH:mm', { locale: id });
        } catch (error) {
            return dateTimeString;
        }
    };

    const handleExportJPG = async () => {
        try {
            const exportContainer = document.getElementById('presensi-export-container');
            if (!exportContainer) {
                toast.error('Kontainer export tidak ditemukan');
                return;
            }

            toast.loading('Mengkonversi ke JPG...', { duration: 2000 });

            const canvas = await html2canvas(exportContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Sembunyikan tombol-tombol saat export
                    const clonedButtons = clonedDoc.querySelectorAll('.no-export');
                    clonedButtons.forEach(btn => btn.style.display = 'none');
                }
            });

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `presensi-${kegiatan.nama_kegiatan}-${new Date().toISOString().split('T')[0]}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success('Export JPG berhasil');
            }, 'image/jpeg', 0.9);

        } catch (error) {
            console.error('Error exporting JPG:', error);
            toast.error('Gagal export JPG');
        }
    };

    const handleExportExcel = () => {
        try {
            toast.loading('Menyiapkan data Excel...', { duration: 2000 });

            // Prepare data for Excel
            const excelData = filteredPresensi.map((presensi, index) => ({
                'No': index + 1,
                'Nama Lengkap': presensi.nama_lengkap,
                'Jenis Kelamin': presensi.jenis_kelamin || '-',
                'Kelompok': presensi.kelompok || '-',
                'Desa': presensi.desa || '-',
                'Kategori': presensi.user?.kategori || '-',
                'Status': getStatusLabel(presensi.status),
                'Waktu Presensi': formatDateTime(presensi.waktu_presensi),
                'Keterangan': presensi.alasan_izin || '-'
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const wscols = [
                { wch: 5 },  // No
                { wch: 30 }, // Nama Lengkap
                { wch: 15 }, // Jenis Kelamin
                { wch: 20 }, // Kelompok
                { wch: 20 }, // Desa
                { wch: 15 }, // Kategori
                { wch: 15 }, // Status
                { wch: 20 }, // Waktu Presensi
                { wch: 30 }  // Keterangan
            ];
            ws['!cols'] = wscols;

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data Presensi');

            // Save file
            const fileName = `presensi-${kegiatan.nama_kegiatan}-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success('Export Excel berhasil');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Gagal export Excel');
        }
    };

    if (!kegiatan) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Pilih Kegiatan</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">Klik salah satu kegiatan untuk melihat detail presensi</div>
            </div>
        );
    }

    return (
        <div id="presensi-export-container" className="space-y-6 bg-white dark:bg-gray-800 p-4 rounded-xl">
            {/* Header dengan tombol QR Scanner */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Presensi: {kegiatan.nama_kegiatan}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {format(new Date(kegiatan.tanggal), 'EEEE, d MMMM yyyy', { locale: id })} • {kegiatan.jam_mulai.substring(0, 5)}
                    </p>
                </div>
                <div className="flex space-x-2 no-export">
                    <button
                        onClick={handleExportExcel}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export Excel</span>
                    </button>
                    <button
                        onClick={handleExportJPG}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Export JPG</span>
                    </button>
                    <button
                        onClick={onQrScanner}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                        </svg>
                        <span>QR Scanner</span>
                    </button>
                </div>
            </div>

            {/* Filter dan Pencarian */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 no-export">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Filter Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="semua">Semua</option>
                            <option value="hadir">Hadir</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="izin">Izin</option>
                        </select>
                    </div>

                    {/* Filter Kelompok */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kelompok
                        </label>
                        <select
                            value={filterKelompok}
                            onChange={(e) => setFilterKelompok(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="semua">Semua</option>
                            {kelompokOptions.map(kelompok => (
                                <option key={kelompok} value={kelompok}>{kelompok}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Desa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Desa
                        </label>
                        <select
                            value={filterDesa}
                            onChange={(e) => setFilterDesa(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="semua">Semua</option>
                            {desaOptions.map(desa => (
                                <option key={desa} value={desa}>{desa}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kategori
                        </label>
                        <select
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="semua">Semua</option>
                            {kategoriOptions.map(kategori => (
                                <option key={kategori} value={kategori}>{kategori}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Jenis Kelamin */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Jenis Kelamin
                        </label>
                        <select
                            value={filterJenisKelamin}
                            onChange={(e) => setFilterJenisKelamin(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="semua">Semua</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    {/* Pencarian */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cari
                        </label>
                        <input
                            type="text"
                            placeholder="Cari nama anggota..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Tabel Presensi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    NO
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    NAMA LENGKAP
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    JENIS KELAMIN
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    KELOMPOK
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    DESA
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    KATEGORI
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    STATUS
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    WAKTU PRESENSI
                                </th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    KETERANGAN
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPresensi.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="text-4xl mb-2">📝</div>
                                        <div className="text-lg">Tidak ada data presensi</div>
                                        <div className="text-sm">Gunakan QR Scanner untuk menambah presensi</div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((presensi, index) => (
                                    <tr key={presensi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {presensi.nama_lengkap}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {presensi.jenis_kelamin || '-'}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {presensi.kelompok || '-'}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {presensi.desa || '-'}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {presensi.user?.kategori || '-'}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(presensi.status)}`}>
                                                {getStatusLabel(presensi.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDateTime(presensi.waktu_presensi)}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {presensi.alasan_izin || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info jumlah data */}
            <div className="flex flex-col gap-4 no-export">
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Menampilkan {filteredPresensi.length} dari {presensiList.length} presensi (Difilter)
                </div>

                {filteredPresensi.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredPresensi.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={onPageChange}
                        onItemsPerPageChange={setItemsPerPage}
                        itemsPerPageOptions={[10, 25, 50, 100]}
                    />
                )}
            </div>
        </div>
    );
};

export default DetailPresensiTable; 
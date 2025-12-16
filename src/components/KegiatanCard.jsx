import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const KegiatanCard = ({ kegiatan, onEdit, onDelete, onClick }) => {
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
      return format(date, 'EEEE, d MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format HH:MM
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(kegiatan)}
    >
      {/* Header dengan status */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 pr-4">
          {kegiatan.nama_kegiatan}
        </h3>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(kegiatan.status)}`}>
          {getStatusLabel(kegiatan.status)}
        </span>
      </div>

      {/* Detail kegiatan */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            {formatDate(kegiatan.tanggal)}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            {formatTime(kegiatan.jam_mulai)}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            {kegiatan.lokasi}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            {kegiatan.kategori_kegiatan || 'Kelompok'}
          </span>
        </div>

        {kegiatan.deskripsi && (
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {kegiatan.deskripsi}
            </span>
          </div>
        )}
      </div>

      {/* Tombol aksi */}
      <div className="flex space-x-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(kegiatan);
          }}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(kegiatan);
          }}
          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

export default KegiatanCard; 
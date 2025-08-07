import React from 'react';

const RecentActivity = ({ activities }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'hadir':
        return 'bg-green-500';
      case 'terlambat':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'hadir':
        return 'Hadir';
      case 'terlambat':
        return 'Terlambat';
      default:
        return 'Tidak Hadir';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Aktivitas Terbaru
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activities.length} aktivitas
        </span>
      </div>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {activity.nama}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.jenis}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.kelompok}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-100">
                  {getStatusText(activity.status)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(activity.waktu)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(activity.waktu)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📊</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Belum ada aktivitas presensi
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Aktivitas presensi akan muncul di sini
            </p>
          </div>
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
            Lihat Semua Aktivitas →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 
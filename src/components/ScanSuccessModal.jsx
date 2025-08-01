import React from 'react';

const ScanSuccessModal = ({ isVisible, status, message, onClose }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 mx-4 max-w-sm w-full shadow-2xl transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            status === 'hadir' 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-orange-100 dark:bg-orange-900/30'
          }`}>
            <div className={`text-4xl ${status === 'hadir' ? 'text-green-600' : 'text-orange-600'}`}>
              {status === 'hadir' ? '✅' : '⏰'}
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold text-center mb-2 ${
          status === 'hadir' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-orange-600 dark:text-orange-400'
        }`}>
          Presensi Berhasil!
        </h2>

        {/* Status */}
        <div className={`text-center mb-4 ${
          status === 'hadir' 
            ? 'text-green-700 dark:text-green-300' 
            : 'text-orange-700 dark:text-orange-300'
        }`}>
          <p className="text-lg font-semibold">
            Status: {status === 'hadir' ? 'Hadir' : 'Terlambat'}
          </p>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm">
          {message}
        </p>

        {/* Instruction */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-blue-700 dark:text-blue-300 text-center text-sm font-medium">
            Klik di mana saja untuk menutup notifikasi ini
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ScanSuccessModal; 
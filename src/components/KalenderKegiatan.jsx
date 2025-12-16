import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

const KalenderKegiatan = ({ kegiatanList, presensiList, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Navigasi bulan
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Generate kalender untuk bulan yang dipilih
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get kegiatan untuk tanggal tertentu
  const getKegiatanForDate = (date) => {
    return kegiatanList.filter(kegiatan => 
      isSameDay(new Date(kegiatan.tanggal), date)
    );
  };

  // Get presensi untuk tanggal tertentu
  const getPresensiForDate = (date) => {
    const kegiatanIds = getKegiatanForDate(date).map(k => k.id);
    return presensiList.filter(presensi => 
      kegiatanIds.includes(presensi.kegiatan_id)
    );
  };

  // Hitung statistik untuk tanggal tertentu
  const getDateStats = (date) => {
    const presensi = getPresensiForDate(date);
    if (presensi.length === 0) return null;

    const hadir = presensi.filter(p => p.status === 'hadir').length;
    const terlambat = presensi.filter(p => p.status === 'terlambat').length;
    const izin = presensi.filter(p => p.status === 'izin').length;

    return { hadir, terlambat, izin, total: presensi.length };
  };

  // Format nama bulan
  const monthName = format(currentMonth, 'MMMM yyyy', { locale: id });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Kalender Kegiatan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Lihat jadwal kegiatan dan presensi dalam kalender
        </p>
      </div>

      {/* Navigasi Bulan */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 capitalize">
          {monthName}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Kalender */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Hari */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Kalender */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const kegiatan = getKegiatanForDate(day);
            const stats = getDateStats(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                onClick={() => onDateSelect(day)}
                className={`
                  min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                  ${isCurrentDay ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700
                `}
              >
                {/* Tanggal */}
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
                  ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}
                `}>
                  {format(day, 'd')}
                </div>

                {/* Kegiatan */}
                {kegiatan.length > 0 && (
                  <div className="space-y-1">
                    {kegiatan.slice(0, 2).map((k, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 truncate"
                        title={k.nama_kegiatan}
                      >
                        {k.nama_kegiatan}
                      </div>
                    ))}
                    {kegiatan.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{kegiatan.length - 2} lagi
                      </div>
                    )}
                  </div>
                )}

                {/* Statistik Presensi */}
                {stats && (
                  <div className="mt-2 text-xs">
                    <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                      <span>✓</span>
                      <span>{stats.hadir}</span>
                    </div>
                    {stats.terlambat > 0 && (
                      <div className="flex items-center justify-between text-yellow-600 dark:text-yellow-400">
                        <span>⏰</span>
                        <span>{stats.terlambat}</span>
                      </div>
                    )}
                    {stats.izin > 0 && (
                      <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                        <span>📝</span>
                        <span>{stats.izin}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Keterangan
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Kegiatan</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Hadir</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Terlambat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Izin</span>
          </div>
        </div>
      </div>

      {/* Info Tambahan */}
      {kegiatanList.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📅</div>
          <div className="text-gray-500 dark:text-gray-400">
            Belum ada kegiatan yang dijadwalkan
          </div>
        </div>
      )}
    </div>
  );
};

export default KalenderKegiatan; 
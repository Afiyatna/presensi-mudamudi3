import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

export default function CalendarView({ presensiList, onDateClick, currentMonth, onMonthChange }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days to start week on Monday
    const firstDayOfWeek = start.getDay();
    const paddingStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const paddingDays = [];
    for (let i = paddingStart; i > 0; i--) {
      paddingDays.push(new Date(start.getTime() - i * 24 * 60 * 60 * 1000));
    }
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

  const getPresensiForDate = (date) => {
    return presensiList.filter(presensi => {
      const presensiDate = new Date(presensi.waktu_presensi);
      return isSameDay(presensiDate, date);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-800';
      case 'terlambat': return 'bg-yellow-100 text-yellow-800';
      case 'izin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const isCurrentMonth = (date) => {
    return isSameMonth(date, currentMonth);
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {format(currentMonth, 'MMMM yyyy', { locale: id })}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const presensiForDate = getPresensiForDate(date);
            const hasPresensi = presensiForDate.length > 0;
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-[80px] p-2 border border-slate-200 dark:border-slate-700 cursor-pointer
                  transition-colors hover:bg-slate-50 dark:hover:bg-slate-700
                  ${!isCurrentMonth(date) ? 'bg-slate-50 dark:bg-slate-800 text-slate-400' : ''}
                  ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                  ${selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                {/* Date Number */}
                <div className={`
                  text-sm font-medium mb-1
                  ${!isCurrentMonth(date) ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}
                  ${isToday(date) ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                `}>
                  {format(date, 'd')}
                </div>

                {/* Presensi Indicators */}
                {hasPresensi && (
                  <div className="space-y-1">
                    {presensiForDate.slice(0, 3).map((presensi, idx) => (
                      <div
                        key={idx}
                        className={`
                          text-xs px-1 py-0.5 rounded truncate
                          ${getStatusColor(presensi.status)}
                        `}
                        title={`${presensi.nama_lengkap} - ${presensi.status}`}
                      >
                        {presensi.nama_lengkap.split(' ')[0]} - {presensi.status}
                      </div>
                    ))}
                    {presensiForDate.length > 3 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        +{presensiForDate.length - 3} lagi
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
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-slate-600 dark:text-slate-400">Hadir</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span className="text-slate-600 dark:text-slate-400">Terlambat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-slate-600 dark:text-slate-400">Izin</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
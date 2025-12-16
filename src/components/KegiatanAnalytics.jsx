import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { kegiatanService } from '../lib/kegiatanService';
import { presensiKegiatanService } from '../lib/presensiKegiatanService';
import { izinKegiatanService } from '../lib/izinKegiatanService';
import { toast } from 'react-hot-toast';

const KegiatanAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalKegiatan: 0,
    totalPresensi: 0,
    totalIzin: 0,
    presensiRate: 0,
    topKegiatan: [],
    presensiTrend: [],
    statusDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    to: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [kegiatan, presensi, izin] = await Promise.all([
        kegiatanService.getAllKegiatan(),
        presensiKegiatanService.getAllPresensi(),
        izinKegiatanService.getAllIzin()
      ]);

      // Filter by date range
      const filteredKegiatan = kegiatan.filter(k => 
        new Date(k.tanggal) >= new Date(dateRange.from) && 
        new Date(k.tanggal) <= new Date(dateRange.to)
      );

      const filteredPresensi = presensi.filter(p => 
        new Date(p.created_at) >= new Date(dateRange.from) && 
        new Date(p.created_at) <= new Date(dateRange.to)
      );

      const filteredIzin = izin.filter(i => 
        new Date(i.created_at) >= new Date(dateRange.from) && 
        new Date(i.created_at) <= new Date(dateRange.to)
      );

      // Calculate analytics
      const totalKegiatan = filteredKegiatan.length;
      const totalPresensi = filteredPresensi.length;
      const totalIzin = filteredIzin.length;
      
      // Calculate presensi rate per kegiatan
      const presensiRate = totalKegiatan > 0 ? (totalPresensi / totalKegiatan).toFixed(1) : 0;

      // Top kegiatan by presensi count
      const kegiatanPresensiCount = {};
      filteredPresensi.forEach(p => {
        const kegiatanId = p.kegiatan_id;
        kegiatanPresensiCount[kegiatanId] = (kegiatanPresensiCount[kegiatanId] || 0) + 1;
      });

      const topKegiatan = Object.entries(kegiatanPresensiCount)
        .map(([kegiatanId, count]) => {
          const kegiatan = filteredKegiatan.find(k => k.id === kegiatanId);
          return {
            nama: kegiatan?.nama_kegiatan || 'Unknown',
            count,
            tanggal: kegiatan?.tanggal
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Presensi trend by month
      const presensiByMonth = {};
      filteredPresensi.forEach(p => {
        const month = new Date(p.created_at).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        presensiByMonth[month] = (presensiByMonth[month] || 0) + 1;
      });

      const presensiTrend = Object.entries(presensiByMonth).map(([month, count]) => ({
        month,
        count
      }));

      // Status distribution
      const statusCount = {};
      filteredPresensi.forEach(p => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
      });

      const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count
      }));

      setAnalyticsData({
        totalKegiatan,
        totalPresensi,
        totalIzin,
        presensiRate,
        topKegiatan,
        presensiTrend,
        statusDistribution
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Analytics Kegiatan
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <span className="text-gray-500 dark:text-gray-400">s/d</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Kegiatan</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analyticsData.totalKegiatan}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Presensi</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.totalPresensi}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Izin</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analyticsData.totalIzin}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Rata-rata Presensi</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analyticsData.presensiRate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Kegiatan */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Top 5 Kegiatan</h3>
            <div className="space-y-3">
              {analyticsData.topKegiatan.map((kegiatan, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{kegiatan.nama}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{kegiatan.tanggal}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {kegiatan.count} presensi
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribusi Status</h3>
            <div className="space-y-3">
              {analyticsData.statusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      status.status === 'hadir' ? 'bg-green-500' :
                      status.status === 'terlambat' ? 'bg-yellow-500' :
                      status.status === 'izin' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {status.status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Presensi Trend */}
        {analyticsData.presensiTrend.length > 0 && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Trend Presensi per Bulan</h3>
            <div className="flex items-end justify-between h-32">
              {analyticsData.presensiTrend.map((trend, index) => {
                const maxCount = Math.max(...analyticsData.presensiTrend.map(t => t.count));
                const height = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                      {trend.month}
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {trend.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KegiatanAnalytics; 
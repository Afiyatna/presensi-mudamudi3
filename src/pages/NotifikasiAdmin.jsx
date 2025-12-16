import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import { toast } from 'react-hot-toast';

export default function NotifikasiAdmin() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'izin_kegiatan' },
        (payload) => {
          // Add new notification when izin is created
          const newNotification = {
            id: payload.new.id,
            type: 'izin_baru',
            title: 'Permintaan Izin Baru',
            message: `${payload.new.nama_lengkap} mengajukan izin untuk kegiatan`,
            timestamp: new Date().toISOString(),
            read: false,
            data: payload.new
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch recent izin requests as notifications
      const { data: izinData, error: izinError } = await supabase
        .from('izin_kegiatan')
        .select(`
          *,
          kegiatan: kegiatan_id (
            nama_kegiatan,
            tanggal,
            jam_mulai,
            lokasi
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (izinError) throw izinError;

      // Convert izin data to notification format
      const izinNotifications = (izinData || []).map(izin => ({
        id: izin.id,
        type: 'izin_baru',
        title: 'Permintaan Izin Baru',
        message: `${izin.nama_lengkap} mengajukan izin untuk kegiatan ${izin.kegiatan?.nama_kegiatan}`,
        timestamp: izin.created_at,
        read: false,
        data: izin
      }));

      // Fetch recent presensi as notifications
      const { data: presensiData, error: presensiError } = await supabase
        .from('presensi_kegiatan')
        .select(`
          *,
          kegiatan: kegiatan_id (
            nama_kegiatan,
            tanggal,
            jam_mulai,
            lokasi
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (presensiError) throw presensiError;

      const presensiNotifications = (presensiData || []).map(presensi => ({
        id: presensi.id,
        type: 'presensi_baru',
        title: 'Presensi Baru',
        message: `${presensi.nama_lengkap} melakukan presensi untuk kegiatan ${presensi.kegiatan?.nama_kegiatan}`,
        timestamp: presensi.created_at,
        read: false,
        data: presensi
      }));

      // Combine and sort notifications
      const allNotifications = [...izinNotifications, ...presensiNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'izin_baru':
        return '📝';
      case 'presensi_baru':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'izin_baru':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'presensi_baru':
        return 'border-l-4 border-l-green-500 bg-green-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam yang lalu`;
    return notifTime.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <DataLoadingSpinner />;

  return (
    <LayoutDashboard>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Notifikasi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Kelola semua notifikasi sistem dan permintaan izin
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Tandai Semua Dibaca
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Notification Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Notifikasi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {notifications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Permintaan Izin
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {notifications.filter(n => n.type === 'izin_baru').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Presensi Baru
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {notifications.filter(n => n.type === 'presensi_baru').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        {notification.data?.kegiatan && (
                          <span className="mt-1 sm:mt-0">
                            📅 {notification.data.kegiatan.nama_kegiatan}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-2 sm:ml-4">
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Baru
                        </span>
                      )}
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        {notification.read ? 'Tandai Baru' : 'Tandai Dibaca'}
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800 text-xs underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutDashboard>
  );
} 
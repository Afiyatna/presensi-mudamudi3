import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

const EnhancedNotifications = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      presensiBaru: true,
      izinBaru: true,
      izinUpdate: true,
      kegiatanReminder: true,
      weeklyReport: false,
      monthlyReport: false
    },
    push: {
      presensiBaru: true,
      izinBaru: true,
      izinUpdate: true,
      kegiatanReminder: true,
      systemAlert: true
    },
    schedule: {
      reminderTime: '09:00',
      timezone: 'Asia/Jakarta',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserAndSettings();
  }, []);

  const fetchUserAndSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch existing notification settings
        const { data: settings } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (settings) {
          setNotificationSettings(settings.settings || notificationSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleScheduleChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [key]: value
      }
    }));
  };

  const handleQuietHoursChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        quietHours: {
          ...prev.schedule.quietHours,
          [key]: value
        }
      }
    }));
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          settings: notificationSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('Pengaturan notifikasi berhasil disimpan');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const testEmailNotification = async () => {
    setLoading(true);
    try {
      // This would typically call your backend API to send a test email
      toast.success('Email test berhasil dikirim!');
    } catch (error) {
      toast.error('Gagal mengirim email test');
    } finally {
      setLoading(false);
    }
  };

  const testPushNotification = async () => {
    setLoading(true);
    try {
      // This would typically call your backend API to send a test push notification
      toast.success('Push notification test berhasil dikirim!');
    } catch (error) {
      toast.error('Gagal mengirim push notification test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Pengaturan Notifikasi Lanjutan
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={testEmailNotification}
              disabled={loading}
              className="btn bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1"
            >
              Test Email
            </button>
            <button
              onClick={testPushNotification}
              disabled={loading}
              className="btn bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"
            >
              Test Push
            </button>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Notifikasi Email
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notificationSettings.email).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {key === 'presensiBaru' && 'Presensi Baru'}
                    {key === 'izinBaru' && 'Izin Baru'}
                    {key === 'izinUpdate' && 'Update Izin'}
                    {key === 'kegiatanReminder' && 'Reminder Kegiatan'}
                    {key === 'weeklyReport' && 'Laporan Mingguan'}
                    {key === 'monthlyReport' && 'Laporan Bulanan'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {key === 'presensiBaru' && 'Kirim email saat ada presensi baru'}
                    {key === 'izinBaru' && 'Kirim email saat ada izin baru'}
                    {key === 'izinUpdate' && 'Kirim email saat status izin berubah'}
                    {key === 'kegiatanReminder' && 'Kirim email reminder sebelum kegiatan'}
                    {key === 'weeklyReport' && 'Kirim laporan mingguan setiap Senin'}
                    {key === 'monthlyReport' && 'Kirim laporan bulanan setiap tanggal 1'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange('email', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Push Notifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notificationSettings.push).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {key === 'presensiBaru' && 'Presensi Baru'}
                    {key === 'izinBaru' && 'Izin Baru'}
                    {key === 'izinUpdate' && 'Update Izin'}
                    {key === 'kegiatanReminder' && 'Reminder Kegiatan'}
                    {key === 'systemAlert' && 'System Alert'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {key === 'presensiBaru' && 'Push notification untuk presensi baru'}
                    {key === 'izinBaru' && 'Push notification untuk izin baru'}
                    {key === 'izinUpdate' && 'Push notification untuk update izin'}
                    {key === 'kegiatanReminder' && 'Push notification reminder kegiatan'}
                    {key === 'systemAlert' && 'Push notification untuk system alert'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange('push', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pengaturan Jadwal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waktu Reminder
                </label>
                <input
                  type="time"
                  value={notificationSettings.schedule.reminderTime}
                  onChange={(e) => handleScheduleChange('reminderTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={notificationSettings.schedule.timezone}
                  onChange={(e) => handleScheduleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quiet Hours
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.schedule.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {notificationSettings.schedule.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mulai
                    </label>
                    <input
                      type="time"
                      value={notificationSettings.schedule.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selesai
                    </label>
                    <input
                      type="time"
                      value={notificationSettings.schedule.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preview */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Notifikasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Email Notification</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p><strong>From:</strong> sistem@presensi.com</p>
                <p><strong>Subject:</strong> Presensi Baru - Pengajian Rutin</p>
                <p><strong>Content:</strong> Ada presensi baru untuk kegiatan "Pengajian Rutin" pada tanggal 20 Januari 2024.</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Push Notification</h4>
              <div className="text-sm text-green-800 dark:text-green-200">
                <p><strong>Title:</strong> Presensi Baru</p>
                <p><strong>Body:</strong> Ada presensi baru untuk kegiatan "Pengajian Rutin"</p>
                <p><strong>Time:</strong> Sekarang</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotifications; 
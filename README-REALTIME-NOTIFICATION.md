# Real-Time Notification System untuk QR Code Scanning

## 📋 Overview

Sistem notifikasi real-time ini memungkinkan user untuk menerima notifikasi langsung di layar mereka ketika QR code mereka di-scan oleh admin. Notifikasi akan muncul sebagai modal yang menutupi layar dengan informasi status presensi.

## 🔧 Cara Kerja

### 1. **User Side (UserQRCode.jsx)**
- User membuka halaman QR Code mereka
- Sistem mendaftarkan real-time subscription untuk tabel `presensi_daerah` dan `presensi_desa`
- Ketika ada data baru yang dimasukkan ke tabel tersebut, sistem akan mengecek apakah `nama_lengkap` cocok dengan user yang sedang login
- Jika cocok, modal notifikasi akan muncul dengan status presensi

### 2. **Admin Side (QrScannerDaerah.jsx & QrScannerDesa.jsx)**
- Admin scan QR code user
- Sistem menyimpan data presensi ke database
- Data yang disimpan akan trigger real-time event
- User akan otomatis menerima notifikasi

### 3. **Real-Time Subscription**
```javascript
// Mendengarkan perubahan pada tabel presensi_daerah
const presensiDaerahSubscription = supabase
  .channel('presensi_daerah_changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'presensi_daerah'
    },
    (payload) => {
      if (payload.new.nama_lengkap === namaLengkap) {
        showPresensiSuccess(payload.new.status, 'daerah');
      }
    }
  )
  .subscribe();
```

## 🎯 Fitur

### **Modal Notifikasi**
- **Fullscreen Overlay**: Menutupi seluruh layar user
- **Status Visual**: Icon dan warna berbeda untuk Hadir (✅ hijau) dan Terlambat (⏰ oranye)
- **Informasi Lengkap**: Menampilkan jenis presensi (daerah/desa) dan status
- **Interaksi Mudah**: Klik di mana saja untuk menutup

### **Keamanan**
- **Filter Nama**: Hanya user yang bersangkutan yang menerima notifikasi
- **Real-time**: Notifikasi muncul secara instan tanpa refresh halaman
- **Auto-cleanup**: Subscription dibersihkan saat komponen unmount

## 🛠️ Konfigurasi

### **Supabase Client**
```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### **Database Requirements**
- Tabel `presensi_daerah` dan `presensi_desa` harus memiliki kolom `nama_lengkap`
- Realtime harus diaktifkan di Supabase Dashboard
- Row Level Security (RLS) harus dikonfigurasi dengan benar

## 📱 User Experience

### **Flow Lengkap:**
1. User membuka halaman QR Code
2. Admin scan QR code user
3. Data presensi disimpan ke database
4. Real-time event ter-trigger
5. Modal notifikasi muncul di layar user
6. User melihat status presensi mereka
7. User klik untuk menutup notifikasi

### **Keuntungan:**
- **Instant Feedback**: User langsung tahu bahwa presensi mereka berhasil
- **Status Clear**: Menampilkan apakah Hadir atau Terlambat
- **No Refresh**: Tidak perlu refresh halaman
- **Professional**: Tampilan yang menarik dan profesional

## 🔍 Troubleshooting

### **Notifikasi Tidak Muncul:**
1. Pastikan Realtime diaktifkan di Supabase Dashboard
2. Periksa console browser untuk error
3. Pastikan nama_lengkap di database cocok dengan user
4. Periksa koneksi internet

### **Multiple Notifications:**
1. Pastikan subscription dibersihkan dengan benar
2. Periksa apakah ada multiple subscription yang terdaftar

## 📝 Catatan Penting

- Sistem ini memerlukan koneksi internet yang stabil
- User harus tetap di halaman QR Code untuk menerima notifikasi
- Notifikasi hanya muncul untuk presensi yang baru saja dilakukan
- Modal akan otomatis hilang jika user refresh halaman 
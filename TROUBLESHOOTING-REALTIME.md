# Troubleshooting Real-Time Notification System

## 🔍 **Masalah yang Ditemukan:**

1. **Loading terus-menerus di admin**
2. **Notifikasi tidak muncul di user**
3. **Error kamera scanner**

## ✅ **Perbaikan yang Telah Dilakukan:**

### 1. **Perbaikan QR Scanner**
- ✅ Menambahkan error handling yang lebih baik
- ✅ Reset loading state saat start scanner
- ✅ Logging untuk debugging
- ✅ Proper cleanup untuk scanner instance

### 2. **Perbaikan Real-time Subscription**
- ✅ Menambahkan logging untuk debugging
- ✅ Memperbaiki filter berdasarkan nama_lengkap
- ✅ Status subscription monitoring
- ✅ Better error handling

### 3. **Komponen Debug**
- ✅ `RealtimeTest.jsx`: Untuk monitoring real-time events
- ✅ Enhanced logging di semua komponen
- ✅ Status indicator untuk koneksi

## 🧪 **Cara Testing:**

### **Step 1: Buka Console Browser**
1. Buka halaman QR Code user
2. Buka Developer Tools (F12)
3. Lihat tab Console

### **Step 2: Monitor Logs**
Cari log berikut:
```
UserQRCode: Setting up real-time subscriptions for [nama]
UserQRCode: Daerah subscription status: SUBSCRIBED
UserQRCode: Desa subscription status: SUBSCRIBED
```

### **Step 3: Test Scan**
1. Buka halaman QR Scanner admin
2. Scan QR code user
3. Monitor console untuk logs:
```
QR Code detected: [user-id]
Presensi error: [error-details] (jika ada)
UserQRCode: Received presensi daerah event: [data]
UserQRCode: Match found! Showing notification for daerah
```

## 🔧 **Troubleshooting Steps:**

### **Jika Loading Terus-menerus:**
1. **Check Console**: Lihat error di browser console
2. **Restart Scanner**: Klik "Restart Scanner"
3. **Check Camera Permission**: Pastikan izin kamera diberikan
4. **Check Network**: Pastikan koneksi internet stabil

### **Jika Notifikasi Tidak Muncul:**
1. **Check RealtimeTest Component**: Lihat apakah events diterima
2. **Check Nama Match**: Pastikan nama_lengkap di database cocok
3. **Check Supabase Dashboard**: Pastikan Realtime diaktifkan
4. **Check Console Logs**: Lihat apakah subscription berhasil

### **Jika Error Kamera:**
1. **Refresh Page**: Reload halaman
2. **Check Browser**: Pastikan menggunakan browser modern
3. **Check HTTPS**: Pastikan menggunakan HTTPS (untuk production)
4. **Try Different Camera**: Ganti antara kamera depan/belakang

## 📋 **Checklist Debugging:**

### **Di Halaman UserQRCode:**
- [ ] Console menampilkan "Setting up real-time subscriptions"
- [ ] Status subscription "SUBSCRIBED"
- [ ] RealtimeTest component menampilkan "Connected"
- [ ] Debug info menampilkan nama dan user ID yang benar

### **Di Halaman QR Scanner:**
- [ ] Scanner berhasil start tanpa error
- [ ] QR code terdeteksi (log "QR Code detected")
- [ ] Presensi berhasil disimpan (toast success)
- [ ] Tidak ada loading yang stuck

### **Setelah Scan:**
- [ ] UserQRCode menerima event (log "Received presensi event")
- [ ] Nama match (log "Match found!")
- [ ] Modal notifikasi muncul
- [ ] Status presensi ditampilkan dengan benar

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "Gagal mengakses kamera"**
**Solution:**
- Refresh halaman
- Berikan izin kamera
- Coba browser berbeda
- Pastikan tidak ada aplikasi lain yang menggunakan kamera

### **Issue 2: "Subscription status: TIMED_OUT"**
**Solution:**
- Refresh halaman user
- Check koneksi internet
- Pastikan Supabase Realtime aktif

### **Issue 3: "No match for notification"**
**Solution:**
- Check nama_lengkap di database
- Pastikan format nama sama persis
- Check case sensitivity

### **Issue 4: "Loading terus-menerus"**
**Solution:**
- Klik "Restart Scanner"
- Check console untuk error
- Refresh halaman admin

## 📞 **Jika Masih Bermasalah:**

1. **Screenshot Console**: Ambil screenshot error di console
2. **Check Network Tab**: Lihat apakah ada request yang gagal
3. **Test Manual**: Coba insert data manual ke database
4. **Check Supabase Logs**: Lihat logs di Supabase Dashboard

## 🔄 **Reset & Restart:**

Jika semua troubleshooting tidak berhasil:
1. Clear browser cache
2. Logout dan login kembali
3. Restart development server
4. Check Supabase project settings 
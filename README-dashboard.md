# Presensi Muda Mudi Daerah Kendal — Dashboard Modern

## ✨ Fitur Utama Dashboard

- **Statistik Cards Modern**
  - Total presensi hari ini, bulan ini, attendance rate, total user
  - Trend naik/turun (badge panah & warna)
- **Insight Otomatis**
  - Desa & kelompok dengan kehadiran tertinggi bulan ini
  - Trend kenaikan/penurunan kehadiran
- **Notifikasi Anomali**
  - Alert jika ada penurunan drastis (>30%), desa/kelompok tanpa presensi
- **Grafik Interaktif**
  - Area chart volume presensi bulanan (12 bulan)
  - Mixed chart perbandingan Daerah vs Desa
  - Horizontal bar ranking desa
  - Klik bulan di chart → filter & tampilkan daftar presensi bulan tsb
- **Filtering Lanjutan**
  - Filter multi-kriteria: kelompok, desa, status, jenis kelamin, tanggal, nama
  - Pencarian nama peserta
- **Export Data**
  - Export chart/data ke PDF & Excel (khusus admin)
- **Loading Skeleton**
  - Skeleton cards & chart saat loading, bukan spinner
- **Responsif & Mobile Friendly**
  - Grid, tabel, chart, dan komponen nyaman di semua device
- **Animasi Transisi**
  - Fade-in pada cards, insight, alert
- **Aksesibilitas**
  - Kontras warna, label tombol/input, ARIA label pada tabel & ikon

---

## 📊 Cara Menggunakan Dashboard

1. **Lihat Statistik & Insight**
   - Statistik utama di atas, insight otomatis & alert anomali di bawahnya.
2. **Gunakan Filter**
   - Filter data presensi dengan dropdown, date range, dan pencarian nama.
3. **Interaksi Chart**
   - Klik bulan di area chart → lihat daftar presensi bulan tsb.
   - Reset filter dengan tombol di samping badge bulan aktif.
4. **Export Data**
   - Klik tombol Export PDF/Excel di atas chart untuk mengunduh data.
5. **Mobile**
   - Scroll tabel/chart ke samping jika tidak muat di layar kecil.

---

## 🦾 Aksesibilitas
- Semua tombol penting ada `aria-label`.
- Tabel presensi ada label untuk screen reader.
- Ikon dekoratif diberi `aria-hidden`.
- Kontras warna sudah dioptimalkan untuk dark/light mode.

---

## 🚀 Teknologi
- React, Tailwind CSS, Chart.js, Supabase, jsPDF, html2canvas, xlsx

---

## 📝 Catatan
- Fitur export hanya untuk admin.
- Data & chart otomatis update jika ada perubahan presensi.
- Insight & alert akan muncul otomatis sesuai data terbaru.

---

**Dikembangkan oleh Tim Presensi Muda Mudi Daerah Kendal** 
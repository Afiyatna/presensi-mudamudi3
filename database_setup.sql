-- Database Setup untuk Sistem Presensi Kegiatan
-- Jalankan query ini di Supabase SQL Editor

-- 1. Tabel kegiatan
CREATE TABLE IF NOT EXISTS kegiatan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_kegiatan VARCHAR NOT NULL,
  tanggal DATE NOT NULL,
  jam_mulai TIME NOT NULL,
  lokasi VARCHAR NOT NULL,
  deskripsi TEXT,
  status VARCHAR DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'dibatalkan')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel presensi_kegiatan
CREATE TABLE IF NOT EXISTS presensi_kegiatan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nama_lengkap VARCHAR NOT NULL,
  kelompok VARCHAR,
  desa VARCHAR,
  jenis_kelamin VARCHAR,
  status VARCHAR NOT NULL CHECK (status IN ('hadir', 'terlambat', 'izin')),
  waktu_presensi TIMESTAMP WITH TIME ZONE,
  alasan_izin TEXT,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel izin_kegiatan
CREATE TABLE IF NOT EXISTS izin_kegiatan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nama_lengkap VARCHAR NOT NULL,
  tanggal_izin DATE NOT NULL,
  alasan TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_presensi_kegiatan_kegiatan_id ON presensi_kegiatan(kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_presensi_kegiatan_user_id ON presensi_kegiatan(user_id);
CREATE INDEX IF NOT EXISTS idx_presensi_kegiatan_tanggal ON presensi_kegiatan(waktu_presensi);
CREATE INDEX IF NOT EXISTS idx_izin_kegiatan_kegiatan_id ON izin_kegiatan(kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_izin_kegiatan_user_id ON izin_kegiatan(user_id);
CREATE INDEX IF NOT EXISTS idx_izin_kegiatan_status ON izin_kegiatan(status);
CREATE INDEX IF NOT EXISTS idx_kegiatan_tanggal ON kegiatan(tanggal);
CREATE INDEX IF NOT EXISTS idx_kegiatan_status ON kegiatan(status);

-- 5. Row Level Security (RLS) policies
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE presensi_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE izin_kegiatan ENABLE ROW LEVEL SECURITY;

-- Policy untuk kegiatan (admin bisa CRUD, user bisa read)
CREATE POLICY "Admin can manage kegiatan" ON kegiatan
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view kegiatan" ON kegiatan
  FOR SELECT USING (true);

-- Policy untuk presensi_kegiatan
CREATE POLICY "Users can manage their own presensi" ON presensi_kegiatan
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all presensi" ON presensi_kegiatan
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Policy untuk izin_kegiatan
CREATE POLICY "Users can manage their own izin" ON izin_kegiatan
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all izin" ON izin_kegiatan
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 6. Function untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger untuk update updated_at
CREATE TRIGGER update_kegiatan_updated_at 
    BEFORE UPDATE ON kegiatan 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Sample data untuk testing (opsional)
INSERT INTO kegiatan (nama_kegiatan, tanggal, jam_mulai, lokasi, deskripsi, status) VALUES
('Pengajian Rutin Daerah', '2024-01-15', '19:00:00', 'Masjid Agung', 'Pengajian rutin mingguan tingkat daerah', 'aktif'),
('Pengajian Rutin Desa', '2024-01-16', '19:30:00', 'Masjid Desa', 'Pengajian rutin mingguan tingkat desa', 'aktif')
ON CONFLICT DO NOTHING; 
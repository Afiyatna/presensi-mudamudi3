-- Script SQL untuk Membuat Banyak User Sekaligus di Supabase
-- Jalankan query ini di Supabase SQL Editor
-- 
-- CATATAN PENTING:
-- 1. Script ini menggunakan function yang aman untuk membuat user
-- 2. Password default untuk semua user: "Password123!" (disarankan untuk diubah setelah login pertama)
-- 3. Edit data user di bagian bawah sesuai kebutuhan Anda

-- ============================================
-- STEP 1: Buat Function untuk Create User (Jalankan sekali saja)
-- ============================================
CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_email TEXT,
  p_password TEXT,
  p_nama_lengkap TEXT,
  p_jenis_kelamin TEXT DEFAULT NULL,
  p_tempat_lahir TEXT DEFAULT NULL,
  p_tanggal_lahir DATE DEFAULT NULL,
  p_kelompok TEXT DEFAULT NULL,
  p_desa TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'user',
  p_kategori TEXT DEFAULT 'Muda - Mudi'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_user_metadata JSONB;
BEGIN
  -- Generate UUID untuk user
  v_user_id := gen_random_uuid();
  
  -- Insert ke auth.users (menggunakan Supabase Auth extension)
  -- Catatan: Ini memerlukan akses admin atau menggunakan Supabase Admin API
  -- Alternatif: Gunakan Supabase Dashboard > Authentication > Add User secara manual
  
  -- Insert ke profiles
  INSERT INTO profiles (
    id,
    email,
    nama_lengkap,
    jenis_kelamin,
    tempat_lahir,
    tanggal_lahir,
    kelompok,
    desa,
    role,
    kategori
  ) VALUES (
    v_user_id,
    p_email,
    p_nama_lengkap,
    p_jenis_kelamin,
    p_tempat_lahir,
    p_tanggal_lahir,
    p_kelompok,
    p_desa,
    p_role,
    p_kategori
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Buat User Secara Manual (Edit data di bawah ini)
-- ============================================
-- Password default: "Password123!"
-- Setelah user dibuat, mereka harus login dan mengubah password mereka

-- Contoh: Membuat 5 user sekaligus
-- Edit data di bawah sesuai kebutuhan Anda

DO $$
DECLARE
  user_id UUID;
BEGIN
  -- User 1
  user_id := create_user_with_profile(
    p_email := 'user1@example.com',
    p_password := 'Password123!',
    p_nama_lengkap := 'Nama Lengkap User 1',
    p_jenis_kelamin := 'Laki-laki',
    p_tempat_lahir := 'Kendal',
    p_tanggal_lahir := '2000-01-01',
    p_kelompok := 'PESAWAHAN',
    p_desa := 'KENDAL',
    p_role := 'user',
    p_kategori := 'Muda - Mudi'
  );
  
  -- User 2
  user_id := create_user_with_profile(
    p_email := 'user2@example.com',
    p_password := 'Password123!',
    p_nama_lengkap := 'Nama Lengkap User 2',
    p_jenis_kelamin := 'Perempuan',
    p_tempat_lahir := 'Semarang',
    p_tanggal_lahir := '2001-02-15',
    p_kelompok := 'BRANGSONG',
    p_desa := 'KENDAL',
    p_role := 'user',
    p_kategori := 'Muda - Mudi'
  );
  
  -- User 3
  user_id := create_user_with_profile(
    p_email := 'user3@example.com',
    p_password := 'Password123!',
    p_nama_lengkap := 'Nama Lengkap User 3',
    p_jenis_kelamin := 'Laki-laki',
    p_tempat_lahir := 'Jakarta',
    p_tanggal_lahir := '1999-05-20',
    p_kelompok := 'JATISARI',
    p_desa := 'MIJEN',
    p_role := 'user'
  );
  
  -- User 4
  user_id := create_user_with_profile(
    p_email := 'user4@example.com',
    p_password := 'Password123!',
    p_nama_lengkap := 'Nama Lengkap User 4',
    p_jenis_kelamin := 'Perempuan',
    p_tempat_lahir := 'Bandung',
    p_tanggal_lahir := '2002-08-10',
    p_kelompok := 'WELERI',
    p_desa := 'KENDAL',
    p_role := 'user',
    p_kategori := 'Muda - Mudi'
  );
  
  -- User 5
  user_id := create_user_with_profile(
    p_email := 'user5@example.com',
    p_password := 'Password123!',
    p_nama_lengkap := 'Nama Lengkap User 5',
    p_jenis_kelamin := 'Laki-laki',
    p_tempat_lahir := 'Surabaya',
    p_tanggal_lahir := '2003-12-25',
    p_kelompok := 'PESAWAHAN',
    p_desa := 'KENDAL',
    p_role := 'user'
  );
  
  -- Tambahkan user lain di sini dengan mengcopy-paste block di atas
  -- dan edit datanya sesuai kebutuhan
  
END $$;

-- ============================================
-- ALTERNATIF: Menggunakan Supabase Admin API (Lebih Disarankan)
-- ============================================
-- Karena akses langsung ke auth.users terbatas, cara yang lebih baik adalah:
-- 
-- 1. Gunakan Supabase Dashboard > Authentication > Add User
--    - Tambahkan user satu per satu melalui UI
--    - Setelah user dibuat, jalankan query di bawah untuk insert ke profiles
--
-- 2. Atau gunakan Supabase Admin API dari aplikasi/script terpisah
--
-- 3. Query untuk insert ke profiles saja (setelah user dibuat di Auth):
-- ============================================

-- Query untuk insert ke profiles (setelah user dibuat di Authentication)
-- Ganti user_id dengan UUID dari auth.users yang sudah dibuat

/*
INSERT INTO profiles (
  id,
  email,
  nama_lengkap,
  jenis_kelamin,
  tempat_lahir,
  tanggal_lahir,
  kelompok,
  desa,
  role
) VALUES
  -- User 1 (ganti UUID dengan ID dari auth.users)
  ('00000000-0000-0000-0000-000000000001', 'user1@example.com', 'Nama Lengkap User 1', 'Laki-laki', 'Kendal', '2000-01-01', 'PESAWAHAN', 'KENDAL', 'user'),
  -- User 2
  ('00000000-0000-0000-0000-000000000002', 'user2@example.com', 'Nama Lengkap User 2', 'Perempuan', 'Semarang', '2001-02-15', 'BRANGSONG', 'KENDAL', 'user'),
  -- User 3
  ('00000000-0000-0000-0000-000000000003', 'user3@example.com', 'Nama Lengkap User 3', 'Laki-laki', 'Jakarta', '1999-05-20', 'JATISARI', 'MIJEN', 'user'),
  -- User 4
  ('00000000-0000-0000-0000-000000000004', 'user4@example.com', 'Nama Lengkap User 4', 'Perempuan', 'Bandung', '2002-08-10', 'WELERI', 'KENDAL', 'user'),
  -- User 5
  ('00000000-0000-0000-0000-000000000005', 'user5@example.com', 'Nama Lengkap User 5', 'Laki-laki', 'Surabaya', '2003-12-25', 'PESAWAHAN', 'KENDAL', 'user')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nama_lengkap = EXCLUDED.nama_lengkap,
  jenis_kelamin = EXCLUDED.jenis_kelamin,
  tempat_lahir = EXCLUDED.tempat_lahir,
  tanggal_lahir = EXCLUDED.tanggal_lahir,
  kelompok = EXCLUDED.kelompok,
  desa = EXCLUDED.desa,
  role = EXCLUDED.role;
*/

-- ============================================
-- CARA YANG PALING MUDAH (RECOMMENDED):
-- ============================================
-- 1. Buka Supabase Dashboard > Authentication > Users
-- 2. Klik "Add User" untuk setiap user yang ingin dibuat
--    - Isi email dan password
--    - Setelah user dibuat, catat User ID (UUID)
-- 3. Jalankan query INSERT INTO profiles di atas dengan UUID yang sudah dicatat
-- 4. Atau gunakan script JavaScript/Node.js dengan Supabase Admin API untuk otomatisasi

-- ============================================
-- Script JavaScript untuk Otomatisasi (Opsional)
-- ============================================
-- Buat file terpisah (misal: create-users.js) dan jalankan dengan Node.js
-- 
-- const { createClient } = require('@supabase/supabase-js');
-- const adminKey = 'YOUR_SERVICE_ROLE_KEY'; // Dapatkan dari Supabase Dashboard > Settings > API
-- 
-- const supabaseAdmin = createClient('YOUR_SUPABASE_URL', adminKey);
-- 
-- const users = [
--   { email: 'user1@example.com', password: 'Password123!', nama_lengkap: 'User 1', ... },
--   { email: 'user2@example.com', password: 'Password123!', nama_lengkap: 'User 2', ... },
-- ];
-- 
-- for (const user of users) {
--   const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
--     email: user.email,
--     password: user.password,
--     email_confirm: true
--   });
--   
--   if (authData?.user) {
--     await supabaseAdmin.from('profiles').insert({
--       id: authData.user.id,
--       email: user.email,
--       nama_lengkap: user.nama_lengkap,
--       // ... field lainnya
--     });
--   }
-- }
 
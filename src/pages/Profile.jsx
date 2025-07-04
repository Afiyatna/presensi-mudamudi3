import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import LayoutDashboard from '../layouts/LayoutDashboard';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }
      setEmail(userData.user.email);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      setProfile(data);
      setForm(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nama_lengkap: form.nama_lengkap,
        jenis_kelamin: form.jenis_kelamin,
        tempat_lahir: form.tempat_lahir,
        tanggal_lahir: form.tanggal_lahir,
        kelompok: form.kelompok,
        desa: form.desa,
      })
      .eq('id', profile.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setProfile({ ...profile, ...form });
    setEditMode(false);
    setSuccess(true);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!profile) return <div className="flex justify-center items-center h-screen">Data profile tidak ditemukan.</div>;

  return (
    <LayoutDashboard>
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Profile</h2>
          {success && <div className="mb-4 text-green-600 text-center">Profile berhasil diupdate!</div>}
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          {!editMode ? (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <span className="block text-gray-500 text-sm">Email</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{email}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Nama Lengkap</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.nama_lengkap}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Jenis Kelamin</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.jenis_kelamin}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Tempat Lahir</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.tempat_lahir}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Tanggal Lahir</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.tanggal_lahir}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Kelompok</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.kelompok}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Desa</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.desa}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Role</span>
                  <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.role}</span>
                </div>
              </div>
              <button
                className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <span className="block text-gray-500 text-sm">Email</span>
                <span className="block text-gray-800 dark:text-gray-100 font-medium">{email}</span>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Nama Lengkap</label>
                <input type="text" name="nama_lengkap" className="w-full p-2 border rounded" value={form.nama_lengkap || ''} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Jenis Kelamin</label>
                <select name="jenis_kelamin" className="w-full p-2 border rounded" value={form.jenis_kelamin || ''} onChange={handleChange} required>
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Tempat Lahir</label>
                <input type="text" name="tempat_lahir" className="w-full p-2 border rounded" value={form.tempat_lahir || ''} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggal_lahir" className="w-full p-2 border rounded" value={form.tanggal_lahir || ''} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Kelompok</label>
                <select name="kelompok" className="w-full p-2 border rounded" value={form.kelompok || ''} onChange={handleChange} required>
                  <option value="">Pilih Kelompok</option>
                  <option value="BANGUNSARI 1">BANGUNSARI 1</option>
                  <option value="BANGUNSARI 2">BANGUNSARI 2</option>
                  <option value="BRANGSONG">BRANGSONG</option>
                  <option value="BRAYO">BRAYO</option>
                  <option value="CAMPUREJO">CAMPUREJO</option>
                  <option value="CEPIRING">CEPIRING</option>
                  <option value="DUDUHAN">DUDUHAN</option>
                  <option value="JATIBARANG">JATIBARANG</option>
                  <option value="JATISARI">JATISARI</option>
                  <option value="KALIWUNGU">KALIWUNGU</option>
                  <option value="KEBONADEM">KEBONADEM</option>
                  <option value="KENDAL">KENDAL</option>
                  <option value="NGABEAN BARAT">NGABEAN BARAT</option>
                  <option value="NGABEAN TIMUR">NGABEAN TIMUR</option>
                  <option value="PAGERSARI">PAGERSARI</option>
                  <option value="PASAR PAGI">PASAR PAGI</option>
                  <option value="PATEAN">PATEAN</option>
                  <option value="PAGERUYUNG">PAGERUYUNG</option>
                  <option value="PESAWAHAN">PESAWAHAN</option>
                  <option value="SEKRANJANG">SEKRANJANG</option>
                  <option value="SIROTO">SIROTO</option>
                  <option value="WELERI">WELERI</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Desa</label>
                <select name="desa" className="w-full p-2 border rounded" value={form.desa || ''} onChange={handleChange} required>
                  <option value="">Pilih Desa</option>
                  <option value="BOJA">BOJA</option>
                  <option value="BRANGSONG">BRANGSONG</option>
                  <option value="CEPIRING">CEPIRING</option>
                  <option value="GEMUH">GEMUH</option>
                  <option value="KALIWUNGU">KALIWUNGU</option>
                  <option value="KANGKUNG">KANGKUNG</option>
                  <option value="KENDAL">KENDAL</option>
                  <option value="LIMBANGAN">LIMBANGAN</option>
                  <option value="NGAMPEL">NGAMPEL</option>
                  <option value="PAGERUYUNG">PAGERUYUNG</option>
                  <option value="PATEAN">PATEAN</option>
                  <option value="PEGANDON">PEGANDON</option>
                  <option value="PLANTUNGAN">PLANTUNGAN</option>
                  <option value="ROWOSARI">ROWOSARI</option>
                  <option value="RINGINARUM">RINGINARUM</option>
                  <option value="SINGOROJO">SINGOROJO</option>
                  <option value="SUKOREJO">SUKOREJO</option>
                  <option value="WELERI">WELERI</option>
                </select>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Role</span>
                <span className="block text-gray-800 dark:text-gray-100 font-medium">{profile.role}</span>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700">Simpan</button>
                <button type="button" className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400" onClick={() => setEditMode(false)}>Batal</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
} 
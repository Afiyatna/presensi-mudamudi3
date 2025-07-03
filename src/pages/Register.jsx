import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Daftar kota Indonesia (bisa diganti dengan hasil fetch API jika ingin dinamis)
const kotaIndonesia = [
  'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Palembang', 'Makassar', 'Bogor', 'Depok', 'Tangerang',
  'Bekasi', 'Padang', 'Denpasar', 'Samarinda', 'Pontianak', 'Banjarmasin', 'Yogyakarta', 'Malang', 'Pekanbaru',
  'Kendari', 'Manado', 'Batam', 'Balikpapan', 'Cirebon', 'Kediri', 'Kendal', 'Kudus', 'Salatiga', 'Solo', 'Magelang',
  'Madiun', 'Blitar', 'Jambi', 'Palu', 'Ambon', 'Jayapura', 'Kupang', 'Ternate', 'Sorong', 'Banda Aceh', 'Lhokseumawe',
  'Langsa', 'Binjai', 'Pematangsiantar', 'Sibolga', 'Tebing Tinggi', 'Padangsidempuan', 'Gunungsitoli', 'Sungai Penuh',
  'Lubuklinggau', 'Prabumulih', 'Pagar Alam', 'Palopo', 'Parepare', 'Bau-Bau', 'Bontang', 'Tarakan', 'Tanjungpinang',
  'Tanjungbalai', 'Dumai', 'Metro', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Mataram', 'Bima', 'Tual', 'Tidore',
  'Tomohon', 'Bitung', 'Kotamobagu', 'Gorontalo', 'Palu', 'Pangkalpinang', 'Sofifi', 'Serang', 'Cilegon', 'Cimahi',
  'Tasikmalaya', 'Banjar', 'Pontianak', 'Singkawang', 'Palangka Raya', 'Tarakan', 'Bontang', 'Samarinda', 'Balikpapan',
  'Batam', 'Tanjungpinang', 'Pekanbaru', 'Dumai', 'Padang', 'Bukittinggi', 'Payakumbuh', 'Pariaman', 'Sawahlunto',
  'Solok', 'Padang Panjang', 'Padang Sidempuan', 'Sibolga', 'Gunungsitoli', 'Tebing Tinggi', 'Binjai', 'Medan',
  'Pematangsiantar', 'Tanjungbalai', 'Lubuklinggau', 'Palembang', 'Prabumulih', 'Pagar Alam', 'Bengkulu', 'Jambi',
  'Sungai Penuh', 'Banda Aceh', 'Langsa', 'Lhokseumawe', 'Sabang', 'Subulussalam', 'Banda Aceh', 'Sabang', 'Langsa',
  'Lhokseumawe', 'Subulussalam', 'Tual', 'Ambon', 'Tidore', 'Sofifi', 'Jayapura', 'Sorong', 'Manokwari', 'Merauke',
  'Timika', 'Wamena', 'Nabire', 'Biak', 'Serui', 'Fakfak', 'Kaimana', 'Raja Ampat', 'Sorong Selatan', 'Tambrauw',
  'Maybrat', 'Manokwari Selatan', 'Pegunungan Arfak', 'Mamberamo Raya', 'Mamberamo Tengah', 'Yalimo', 'Lanny Jaya',
  'Nduga', 'Puncak', 'Puncak Jaya', 'Dogiyai', 'Deiyai', 'Intan Jaya', 'Waropen', 'Supiori', 'Keerom', 'Sarmi',
  'Jayapura', 'Yapen', 'Mimika', 'Asmat', 'Boven Digoel', 'Mappi', 'Yahukimo', 'Pegunungan Bintang', 'Tolikara',
  'Paniai', 'Puncak', 'Nabire', 'Biak Numfor', 'Supiori', 'Waropen', 'Sarmi', 'Keerom', 'Jayapura', 'Yapen',
  'Mamberamo Raya', 'Mamberamo Tengah', 'Yalimo', 'Lanny Jaya', 'Nduga', 'Puncak', 'Puncak Jaya', 'Dogiyai',
  'Deiyai', 'Intan Jaya', 'Waropen', 'Supiori', 'Keerom', 'Sarmi', 'Jayapura', 'Yapen', 'Mimika', 'Asmat',
  'Boven Digoel', 'Mappi', 'Yahukimo', 'Pegunungan Bintang', 'Tolikara', 'Paniai', 'Puncak', 'Nabire',
];

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    kelompok: '',
    desa: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [kotaSuggestions, setKotaSuggestions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'tempat_lahir') {
      const val = e.target.value.toLowerCase();
      setKotaSuggestions(val.length > 0 ? kotaIndonesia.filter(k => k.toLowerCase().includes(val)).slice(0, 8) : []);
    }
  };

  const handleSuggestionClick = (kota) => {
    setForm({ ...form, tempat_lahir: kota });
    setKotaSuggestions([]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    // 1. Register ke Supabase Auth
    const { data, error: regError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (regError) {
      setError(regError.message);
      setLoading(false);
      return;
    }
    // 2. Insert ke profiles
    const userId = data?.user?.id || data?.user?.id || data?.user?.id;
    if (!userId) {
      setError('Gagal mendapatkan user ID');
      setLoading(false);
      return;
    }
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: userId,
        nama_lengkap: form.nama_lengkap,
        jenis_kelamin: form.jenis_kelamin,
        tempat_lahir: form.tempat_lahir,
        tanggal_lahir: form.tanggal_lahir,
        kelompok: form.kelompok,
        desa: form.desa,
        role: 'user',
      },
    ]);
    setLoading(false);
    if (profileError) {
      setError(profileError.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Register User Baru</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-center">Registrasi berhasil! Redirect ke login...</div>}
        <input type="email" name="email" placeholder="Email" className="w-full mb-3 p-2 border rounded" value={form.email} onChange={handleChange} required />
        <div className="relative mb-3">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded pr-10"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
          </button>
        </div>
        <input type="text" name="nama_lengkap" placeholder="Nama Lengkap" className="w-full mb-3 p-2 border rounded" value={form.nama_lengkap} onChange={handleChange} required />
        <select name="jenis_kelamin" className="w-full mb-3 p-2 border rounded" value={form.jenis_kelamin} onChange={handleChange} required>
          <option value="">Pilih Jenis Kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <div className="mb-3 relative">
          <input
            type="text"
            name="tempat_lahir"
            placeholder="Tempat Lahir (Kota/Kabupaten)"
            className="w-full p-2 border rounded"
            value={form.tempat_lahir}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          {kotaSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">
              {kotaSuggestions.map((kota, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(kota)}
                >
                  {kota}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="date"
          name="tanggal_lahir"
          className="w-full mb-3 p-2 border rounded"
          value={form.tanggal_lahir}
          onChange={handleChange}
          required
        />
        <select name="kelompok" className="w-full mb-3 p-2 border rounded" value={form.kelompok} onChange={handleChange} required>
          <option value="">Pilih Kelompok</option>
          <option value="BANGUNSARI 1">BANGUNSARI 1</option>
          <option value="BANGUNSARI 2">BANGUNSARI 2</option>
          <option value="BRAYO">BRANGSONG</option>
          <option value="BRANGSONG">BRAYO</option>
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
        <select name="desa" className="w-full mb-6 p-2 border rounded" value={form.desa} onChange={handleChange} required>
          <option value="">Pilih Desa</option>
          <option value="BOJA">PATEAN</option>
          <option value="BRANGSONG">KENDAL</option>
          <option value="KENDAL">BRANGSONG</option>
          <option value="MIJEN">BOJA</option>
          <option value="PATEAN">MIJEN</option>
        </select>
        <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700" disabled={loading}>
          {loading ? 'Loading...' : 'Register'}
        </button>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Sudah punya akun? </span>
          <a href="/login" className="text-violet-600 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
} 
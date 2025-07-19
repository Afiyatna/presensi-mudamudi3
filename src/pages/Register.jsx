import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

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
  const [navOpen, setNavOpen] = useState(false);

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
    if (!profileError) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase
          .from('profiles')
          .update({ email: userData.user.email })
          .eq('id', userData.user.id);
      }
    }
    setLoading(false);
    if (profileError) {
      setError(profileError.message);
      return;
    }
    setSuccess(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navbar */}
      <header className="flex items-center justify-between px-8 py-6 relative">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo Mudamudi" className="h-10 w-10 rounded-full" />
          <span className="font-bold text-lg text-violet-700">GENERUS MUDA KENDAL</span>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 font-semibold text-violet-700 text-base">
          <a href="/" className="text-pink-600">HOME</a>
          <a href="#" className="hover:text-pink-600">SERVICES</a>
          <a href="#" className="hover:text-pink-600">ABOUT US</a>
          <a href="#" className="hover:text-pink-600">CONTACT US</a>
        </nav>
        {/* Hamburger for Mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-violet-400"
          onClick={() => setNavOpen(v => !v)}
          aria-label="Open navigation menu"
        >
          <svg className="h-7 w-7 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Mobile Nav Dropdown */}
        {navOpen && (
          <div className="absolute top-full right-8 mt-2 w-48 bg-white rounded-xl shadow-lg border border-violet-100 flex flex-col z-50 md:hidden animate-fade-in">
            <a href="/" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600 border-b border-violet-50">HOME</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600 border-b border-violet-50">SERVICES</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600 border-b border-violet-50">ABOUT US</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600">CONTACT US</a>
          </div>
        )}
      </header>
      {/* Register Card */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-sm mx-auto z-10">
          <div className="rounded-3xl shadow-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-400 p-1">
            <div className="bg-white rounded-xl p-8 md:p-10 flex flex-col items-center">
              <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2 tracking-wide">Register User Baru</h2>
              <p className="text-justify text-gray-500 mb-4 text-sm md:text-base max-w-md">
                Silakan isi data diri Anda untuk membuat akun baru di <b>Presensi Muda Mudi Daerah Kendal</b>.
              </p>
              
              {error && <div className="mb-2 text-red-500 text-center text-sm">{error}</div>}
              {success && <div className="mb-2 text-green-600 text-center text-sm">Registrasi berhasil! Redirect ke dashboard...</div>}
              {loading && <DataLoadingSpinner message="Memproses registrasi..." />}
              <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z"/></svg>
                  </span>
                  <input type="email" name="email" placeholder="Email" className="w-full pl-10 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800" value={form.email} onChange={handleChange} required />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0-1.657-.403-3.22-1.125-4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                <input type="text" name="nama_lengkap" placeholder="Nama Lengkap" className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800" value={form.nama_lengkap} onChange={handleChange} required />
                <select name="jenis_kelamin" className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800" value={form.jenis_kelamin} onChange={handleChange} required>
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    name="tempat_lahir"
                    placeholder="Tempat Lahir (Kota/Kabupaten)"
                    className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800"
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
                  className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800"
                  value={form.tanggal_lahir}
                  onChange={handleChange}
                  required
                />
                <select name="kelompok" className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800" value={form.kelompok} onChange={handleChange} required>
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
                <select name="desa" className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800 mb-2" value={form.desa} onChange={handleChange} required>
                  <option value="">Pilih Desa</option>
                  <option value="PATEAN">PATEAN</option>
                  <option value="KENDAL">KENDAL</option>
                  <option value="BRANGSONG">BRANGSONG</option>
                  <option value="BOJA">BOJA</option>
                  <option value="MIJEN">MIJEN</option>
                </select>
                <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition" disabled={loading}>
                  {loading ? 'Loading...' : 'Register'}
                </button>
              </form>
              <button
                onClick={() => navigate('/')}
                className="w-full mt-6 bg-white border border-violet-600 text-violet-600 font-semibold py-2 rounded-full shadow hover:bg-violet-50 transition"
              >
                Sudah punya akun? Login
              </button>
            </div>
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                <p className="text-sm text-blue-700 text-justify">
                  <strong>Informasi Penting:</strong> Data yang Anda masukkan akan digunakan untuk sistem presensi. 
                  Pastikan informasi yang Anda berikan akurat dan lengkap.
                </p>
              </div>
          </div>
        </div>
      </div>
      <Footer variant="minimal" />
    </div>
  );
} 
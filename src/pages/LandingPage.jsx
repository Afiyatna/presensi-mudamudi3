import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import undrawLogin from '../images/undraw-login.svg';
import undrawSide from '../images/undraw-side.svg';
import Footer from '../components/Footer';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // State untuk reset password
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  
  // State untuk slider foto
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Data slider foto (ganti dengan foto-foto kegiatan pengajian)
  const sliderImages = [
    {
      src: '/slider/slide1.jpg',
      alt: 'Masjid Baitul Munir',
      title: 'Masjid Baitul Munir Kendal',
      description: ''
    },
    {
      src: '/slider/slide2.jpg', 
      alt: 'Masjid Baitul Munir',
      title: 'Masjid Baitul Munir Kendal',
      description: ''
    },
    {
      src: '/slider/slide3.jpg',
      alt: 'Masjid Baitul Munir',
      title: 'Masjid Baitul Munir Kendal',
      description: ''
    },
    {
      src: '/slider/slide4.jpg',
      alt: 'Muda Mudi Kendal',
      title: 'Muda Mudi Kendal',
      description: 'Foto bersama - Asrama Akhir Tahun 2024'
    }
  ];

  // Auto slide setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    // Ambil role user dari profiles
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setError('User tidak ditemukan');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (!profile?.role) {
      setError('Role user tidak ditemukan');
      return;
    }
    // Redirect sesuai role
    if (profile.role === 'admin') {
      navigate('/dashboard'); // Dashboard admin
    } else {
      navigate('/dashboard'); // Dashboard user
    }
  };

  // Handler reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);
    const redirectTo = window.location.hostname === 'localhost'
      ? 'http://localhost:5173/reset-password'
      : 'https://generusmuda.vercel.app/reset-password';
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo
    });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage('Link reset password telah dikirim ke email jika terdaftar.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-2 relative">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo Mudamudi" className="h-10 w-10 rounded-full" />
          <span className="font-bold text-sm text-violet-700">GENERUS MUDA KENDAL</span>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 font-semibold text-violet-700 text-base">
          <a href="#" className="text-black">HOME</a>
          <a href="#" className="hover:text-black">SERVICES</a>
          <a href="#" className="hover:text-black">ABOUT US</a>
          <a href="#" className="hover:text-black">CONTACT US</a>
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
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-black border-b border-violet-50">HOME</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-black border-b border-violet-50">SERVICES</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-black border-b border-violet-50">ABOUT US</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-black">CONTACT US</a>
          </div>
        )}
      </header>
      {/* Main Content */}
      <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-8 min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
        {/* Background transparan */}
        <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
          <img src="/bg-landing.jpg" alt="Background" className="w-full h-full object-cover opacity-30 dark:opacity-20" />
        </div>
        
        {/* Desktop Layout: Slider di kiri, Login di kanan */}
        <div className="hidden lg:flex w-full h-full items-center justify-center gap-8 z-10">
          {/* Photo Slider - Left Side */}
          <div className="w-1/2 max-w-2xl">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Slider Container */}
              <div className="relative h-96 overflow-hidden">
                {sliderImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-slide.jpg'; // Fallback image
                      }}
                    />
                    {/* Overlay dengan teks */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                        <p className="text-sm opacity-90">{image.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Form - Right Side */}
          <div className="w-1/2 max-w-md">
            <div className="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-800/85 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/60">
              <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-2 tracking-wide">WELCOME</h1>
              <p className="text-justify text-gray-500 dark:text-gray-400 mb-4 text-sm max-w-md">
                Selamat datang di <b>Presensi Muda Mudi Daerah Kendal</b>. Silakan login untuk melanjutkan. Jika belum punya akun, klik Create Account.
              </p>
              
              
              {/* Login Form */}
              {!showReset && (
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                  {error && <div className="mb-2 text-red-500 dark:text-red-400 text-center text-sm">{error}</div>}
                  {loading && <DataLoadingSpinner message="Memproses login..." />}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z"/></svg>
                    </span>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full pl-10 pr-3 py-2 border-2 border-violet-200 dark:border-violet-700/60 rounded-full bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full pl-10 pr-10 py-2 border-2 border-violet-200 dark:border-violet-700/60 rounded-full bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125-4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125-4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition" disabled={loading}>
                    {loading ? 'Loading...' : 'LOGIN'}
                  </button>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <label className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <input type="checkbox" className="accent-violet-500" /> Remember
                    </label>
                    <button type="button" className="text-pink-600 dark:text-pink-400 hover:underline" onClick={() => setShowReset(true)}>
                      Forgot Password?
                    </button>
                  </div>
                </form>
              )}
              
              {/* Reset Password Form */}
              {showReset && (
                <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
                  {resetError && <div className="mb-2 text-red-500 dark:text-red-400 text-center text-sm">{resetError}</div>}
                  {resetMessage && <div className="mb-2 text-green-600 dark:text-green-400 text-center text-sm">{resetMessage}</div>}
                  {resetLoading && <DataLoadingSpinner message="Mengirim link reset..." />}
                  <input
                    type="email"
                    placeholder="Masukkan email anda"
                    className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 dark:border-violet-700/60 rounded-full bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition" disabled={resetLoading}>
                    {resetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                  <button type="button" className="text-violet-600 dark:text-violet-400 hover:underline text-xs mt-2" onClick={() => setShowReset(false)}>
                    Kembali ke Login
                  </button>
                </form>
              )}
              
              <button
                onClick={() => navigate('/register')}
                className="w-full mt-6 bg-white dark:bg-gray-700 border border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400 font-semibold py-2 rounded-full shadow hover:bg-violet-50 dark:hover:bg-gray-600 transition"
              >
                Create Account
              </button>
            </div>
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/60 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-justify">
                  <strong>Sistem Presensi Digital:</strong> Platform untuk mencatat kehadiran kegiatan pengajian 
                  dengan teknologi QR Code yang aman dan akurat.
                </p>
              </div>
          </div>
        </div>
        
        {/* Mobile Layout: Slider di atas, Login di bawah */}
        <div className="lg:hidden w-full flex flex-col items-center justify-center gap-6 z-10">
          {/* Photo Slider - Top (Smaller) */}
          <div className="w-full max-w-sm">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Slider Container */}
              <div className="relative h-48 overflow-hidden">
                {sliderImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-slide.jpg'; // Fallback image
                      }}
                    />
                    {/* Overlay dengan teks */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-bold mb-1">{image.title}</h3>
                        <p className="text-xs opacity-90">{image.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Navigation Arrows - Mobile */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Dots Indicator - Mobile */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Form - Bottom */}
          <div className="w-full max-w-sm">
            <div className="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-800/85 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/60">
              <h1 className="text-2xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-2 tracking-wide">WELCOME</h1>
              <p className="text-justify text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Selamat datang di <b>Presensi Muda Mudi Daerah Kendal</b>. Silakan login untuk melanjutkan. Jika belum punya akun, klik Create Account.
              </p>
          
              
              {/* Login Form - Mobile */}
              {!showReset && (
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
                  {error && <div className="mb-2 text-red-500 dark:text-red-400 text-center text-xs">{error}</div>}
                  {loading && <DataLoadingSpinner message="Memproses login..." />}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z"/></svg>
                    </span>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full pl-9 pr-3 py-2 border-2 border-violet-200 dark:border-violet-700/60 rounded-full bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full pl-9 pr-9 py-2 border-2 border-violet-200 dark:border-violet-700/60 rounded-full bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125-4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125-4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition text-sm" disabled={loading}>
                    {loading ? 'Loading...' : 'LOGIN'}
                  </button>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <label className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <input type="checkbox" className="accent-violet-500" /> Remember
                    </label>
                    <button type="button" className="text-pink-600 dark:text-pink-400 hover:underline" onClick={() => setShowReset(true)}>
                      Forgot Password?
                    </button>
                  </div>
                </form>
              )}
              
              {/* Reset Password Form - Mobile */}
              {showReset && (
                <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-3">
                  {resetError && <div className="mb-2 text-red-500 dark:text-red-400 text-center text-xs">{resetError}</div>}
                  {resetMessage && <div className="mb-2 text-green-600 dark:text-green-400 text-center text-xs">{resetMessage}</div>}
                  {resetLoading && <DataLoadingSpinner message="Mengirim link reset..." />}
                  <input
                    type="email"
                    placeholder="Masukkan email anda"
                    className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 dark:border-violet-700/60 rounded-full bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition text-sm" disabled={resetLoading}>
                    {resetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                  <button type="button" className="text-violet-600 dark:text-violet-400 hover:underline text-xs mt-2" onClick={() => setShowReset(false)}>
                    Kembali ke Login
                  </button>
                </form>
              )}
              
              <button
                onClick={() => navigate('/register')}
                className="w-full mt-4 bg-white dark:bg-gray-700 border border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400 font-semibold py-2 rounded-full shadow hover:bg-violet-50 dark:hover:bg-gray-600 transition text-sm"
              >
                Create Account
              </button>
            </div>
              <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/60 mt-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 text-justify">
                <strong>Sistem Presensi Digital:</strong> Platform untuk mencatat kehadiran kegiatan pengajian 
                dengan teknologi QR Code yang aman dan akurat.
                </p>
              </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import undrawLogin from '../images/undraw-login.svg';
import undrawSide from '../images/undraw-side.svg';

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
      <header className="flex items-center justify-between px-8 py-6 relative">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo Mudamudi" className="h-15 w-15 rounded-full" />
          <span className="font-bold text-lg text-violet-700">GENERUS MUDA KENDAL</span>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 font-semibold text-violet-700 text-base">
          <a href="#" className="text-pink-600">HOME</a>
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
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600 border-b border-violet-50">HOME</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600 border-b border-violet-50">SERVICES</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600 border-b border-violet-50">ABOUT US</a>
            <a href="#" className="px-6 py-3 text-violet-700 font-semibold hover:text-pink-600">CONTACT US</a>
          </div>
        )}
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center relative px-4 py-8">
        {/* Left Illustration */}
        <div className="hidden md:block w-1/4 max-w-xs">
          <img src={undrawLogin} alt="Ilustrasi Login" className="w-full h-auto" />
        </div>
        {/* Card */}
        <div className="w-full md:w-2/4 max-w-lg z-10">
          <div className="rounded-3xl shadow-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-400 p-1">
            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col items-center">
              <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2 tracking-wide">WELCOME</h1>
              <p className="text-justify text-center text-gray-500 mb-8 text-sm md:text-base max-w-md">
                Selamat datang di <b>Presensi Muda Mudi Daerah Kendal</b>. Silakan login untuk melanjutkan. Jika belum punya akun, klik Create Account.
              </p>
              {/* Login Form */}
              {!showReset && (
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                  {error && <div className="mb-2 text-red-500 text-center text-sm">{error}</div>}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z"/></svg>
                    </span>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full pl-10 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800"
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
                      className="w-full pl-10 pr-10 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.13-2.13A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125-4.575m-2.13 2.13A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition" disabled={loading}>
                    {loading ? 'Loading...' : 'LOGIN'}
                  </button>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" className="accent-violet-500" /> Remember
                    </label>
                    <button type="button" className="text-pink-600 hover:underline" onClick={() => setShowReset(true)}>
                      Forgot Password?
                    </button>
                  </div>
                </form>
              )}
              {/* Reset Password Form */}
              {showReset && (
                <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
                  {resetError && <div className="mb-2 text-red-500 text-center text-sm">{resetError}</div>}
                  {resetMessage && <div className="mb-2 text-green-600 text-center text-sm">{resetMessage}</div>}
                  <input
                    type="email"
                    placeholder="Masukkan email anda"
                    className="w-full pl-4 pr-3 py-2 border-2 border-violet-200 rounded-full bg-gray-50 focus:outline-none focus:border-violet-500 text-gray-800"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2 rounded-full mt-2 shadow-md hover:from-violet-700 hover:to-pink-600 transition" disabled={resetLoading}>
                    {resetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                  <button type="button" className="text-violet-600 hover:underline text-xs mt-2" onClick={() => setShowReset(false)}>
                    Kembali ke Login
                  </button>
                </form>
              )}
              <button
                onClick={() => navigate('/register')}
                className="w-full mt-6 bg-white border border-violet-600 text-violet-600 font-semibold py-2 rounded-full shadow hover:bg-violet-50 transition"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
        {/* Right Illustration */}
        <div className="hidden md:block w-1/4 max-w-xs">
          <img src={undrawSide} alt="Ilustrasi Samping" className="w-full h-auto" />
        </div>
      </main>
    </div>
  );
} 
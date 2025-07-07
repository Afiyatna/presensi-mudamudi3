import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'http://localhost:5173/reset-password'
    });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage('Link reset password telah dikirim ke email jika terdaftar.');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Logo Mudamudi"
          src="/logo.jpg"
          className="mx-auto h-12 w-auto"
        />
        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Presensi Muda Mudi Daerah Kendal
        </h1>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Login Form */}
        {!showReset && (
          <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Login</h2>
            {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-4 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className="relative mb-6">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
            <div className="mt-4 text-center">
              <button type="button" className="text-indigo-600 hover:underline text-sm" onClick={() => setShowReset(true)}>
                Lupa Password?
              </button>
            </div>
          </form>
        )}
        {/* Reset Password Form */}
        {showReset && (
          <form onSubmit={handleResetPassword} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Reset Password</h2>
            {resetError && <div className="mb-4 text-red-500 text-center">{resetError}</div>}
            {resetMessage && <div className="mb-4 text-green-600 text-center">{resetMessage}</div>}
            <input
              type="email"
              placeholder="Masukkan email anda"
              className="w-full mb-4 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700" disabled={resetLoading}>
              {resetLoading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
            <div className="mt-4 text-center">
              <button type="button" className="text-gray-600 hover:underline text-sm" onClick={() => setShowReset(false)}>
                Kembali ke Login
              </button>
            </div>
          </form>
        )}
        <button
          onClick={() => navigate('/register')}
          className="flex w-full justify-center rounded-md bg-white border border-indigo-600 px-3 py-2 text-base font-semibold text-indigo-600 shadow-xs hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-4"
        >
          Register
        </button>
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-300">
          Silakan login jika sudah punya akun, atau daftar jika belum terdaftar.
        </p>
      </div>
    </div>
  );
} 
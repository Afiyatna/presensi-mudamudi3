import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate('/'); // Dashboard admin
    } else {
      navigate('/user-qr'); // Dashboard user
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-96">
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
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 
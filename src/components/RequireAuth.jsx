import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data?.session);
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!session) {
    window.location.href = '/';
    return null;
  }
  return children;
}

export function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getSessionAndRole = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      if (data?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        setRole(profile?.role);
      }
      setLoading(false);
    };
    getSessionAndRole();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!session) {
    window.location.href = '/';
    return null;
  }
  if (role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen text-xl font-bold text-red-600">Akses ditolak: Hanya admin yang dapat mengakses halaman ini.</div>;
  }
  return children;
} 
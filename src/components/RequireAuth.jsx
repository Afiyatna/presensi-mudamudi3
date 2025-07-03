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
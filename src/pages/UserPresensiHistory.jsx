import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import LayoutDashboard from '../layouts/LayoutDashboard';

export default function UserPresensiHistory() {
  const [presensi, setPresensi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresensi = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }
      // Ambil nama_lengkap user dari profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('nama_lengkap')
        .eq('id', userData.user.id)
        .single();
      if (!profile) {
        setLoading(false);
        return;
      }
      // Ambil presensi berdasarkan nama_lengkap
      const { data, error } = await supabase
        .from('presensi')
        .select('*')
        .eq('nama_lengkap', profile.nama_lengkap)
        .order('waktu_presensi', { ascending: false });
      setPresensi(data || []);
      setLoading(false);
    };
    fetchPresensi();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <LayoutDashboard>
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Riwayat Presensi Anda</h2>
        {presensi.length === 0 ? (
          <div className="text-gray-500">Belum ada data presensi.</div>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Tanggal & Waktu</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Kelompok</th>
                <th className="border px-4 py-2">Desa</th>
              </tr>
            </thead>
            <tbody>
              {presensi.map((row) => (
                <tr key={row.id}>
                  <td className="border px-4 py-2">{new Date(row.waktu_presensi).toLocaleString('id-ID')}</td>
                  <td className="border px-4 py-2">{row.status}</td>
                  <td className="border px-4 py-2">{row.kelompok}</td>
                  <td className="border px-4 py-2">{row.desa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </LayoutDashboard>
  );
} 
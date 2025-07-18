import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import BottomNavigation from '../components/BottomNavigation';
import LayoutDashboard from '../layouts/LayoutDashboard';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

export default function DataProfileUser() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error) setProfiles(data || []);
      setLoading(false);
    };
    fetchProfiles();
    // Ambil role admin
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      if (profile?.role) setRole(profile.role);
    };
    fetchRole();
  }, []);

  return (
    <LayoutDashboard pageTitle="Data Profile User">
      <div className="p-4 pb-32 min-h-screen flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Data Profile User</h1>
        {loading ? (
          <DataLoadingSpinner message="Memuat data profile user..." />
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border">Nama Lengkap</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Jenis Kelamin</th>
                  <th className="px-4 py-2 border">Tempat Lahir</th>
                  <th className="px-4 py-2 border">Tanggal Lahir</th>
                  <th className="px-4 py-2 border">Kelompok</th>
                  <th className="px-4 py-2 border">Desa</th>
                  <th className="px-4 py-2 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="text-sm text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-2 border">{profile.nama_lengkap}</td>
                    <td className="px-4 py-2 border">{profile.email}</td>
                    <td className="px-4 py-2 border">{profile.jenis_kelamin}</td>
                    <td className="px-4 py-2 border">{profile.tempat_lahir}</td>
                    <td className="px-4 py-2 border">{profile.tanggal_lahir}</td>
                    <td className="px-4 py-2 border">{profile.kelompok}</td>
                    <td className="px-4 py-2 border">{profile.desa}</td>
                    <td className="px-4 py-2 border">{profile.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {role === 'admin' && <BottomNavigation role="admin" />}
      </div>
    </LayoutDashboard>
  );
} 
import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LayoutDashboard({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {role === 'admin' && (
          <>
            <li>
              <Link to="/dashboard-dummy" className="sidebar-link">Dashboard Dummy</Link>
            </li>
            <li>
              <Link to="/rekap-presensi-dummy" className="sidebar-link">Rekap Presensi Dummy</Link>
            </li>
          </>
        )}
      </Sidebar>
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle={pageTitle} />
        <main className="grow">
          {children}
        </main>
      </div>
    </div>
  );
} 
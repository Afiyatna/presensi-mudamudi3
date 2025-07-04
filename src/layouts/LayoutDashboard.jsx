import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import BottomNavigation from '../components/BottomNavigation';
import { supabase } from '../supabaseClient';

function LayoutDashboard({ children, pageTitle }) {
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
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle={pageTitle} />
        <main className="grow pb-20 lg:pb-0">
          {children}
        </main>
        {/* Bottom Navigation - Mobile Only */}
        <BottomNavigation role={role} />
      </div>
    </div>
  );
}

export default LayoutDashboard;

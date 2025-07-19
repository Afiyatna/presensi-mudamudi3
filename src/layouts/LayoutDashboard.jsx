import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import BottomNavigation from '../components/BottomNavigation';
import Footer from '../components/Footer';
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
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Content Area */}
      <div className="relative flex flex-col flex-1 min-h-screen overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle={pageTitle} />
        <main className="grow pb-32 lg:pb-0">
          {children}
        </main>
        {/* Footer di atas Bottom Navigation */}
        <Footer className="mb-20 lg:mb-0" />
        {/* Bottom Navigation - Mobile Only */}
        {role && <BottomNavigation role={role} />}
      </div>
    </div>
  );
}

export default LayoutDashboard;

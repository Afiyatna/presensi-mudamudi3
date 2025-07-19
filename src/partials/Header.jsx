import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SearchModal from '../components/ModalSearch';
import Notifications from '../components/DropdownNotifications';
import Help from '../components/DropdownHelp';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../supabaseClient';
import UserAvatar from '../images/user-avatar-32.png';
import { useThemeProvider } from '../utils/ThemeContext';

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
  pageTitle,
}) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { currentTheme, changeCurrentTheme } = useThemeProvider();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data } = await supabase
        .from('profiles')
        .select('nama_lengkap, role')
        .eq('id', userData.user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}>
          {/* Header: Left side */}
          <div className="flex items-center gap-4">
            
            {/* Page Title */}
            {pageTitle && (
              <span className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 truncate max-w-xs md:max-w-md lg:max-w-lg" title={pageTitle}>{pageTitle}</span>
            )}
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu hamburger - untuk mobile menu */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open mobile menu</span>
              <svg className="w-6 h-6 fill-current text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>

            {/* Desktop buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ml-3 ${searchModalOpen && 'bg-gray-200 dark:bg-gray-800'}`}
                onClick={(e) => { e.stopPropagation(); setSearchModalOpen(true); }}
                aria-controls="search-modal"
              >
                <span className="sr-only">Search</span>
                <svg
                  className="fill-current text-gray-500/80 dark:text-gray-400/80"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                  <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                </svg>
              </button>
              <SearchModal id="search-modal" searchId="search" modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
              <Notifications align="right" />
              <Help align="right" />
              <ThemeToggle />
              <UserMenu align="right" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800">
            <div className="mb-6 flex flex-col items-center">
              <img className="w-14 h-14 rounded-full mb-2" src={UserAvatar} alt="User" />
              <div className="font-medium text-gray-800 dark:text-gray-100 text-lg">{profile ? profile.nama_lengkap : '...'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">{profile ? profile.role : ''}</div>
              
              {/* Menu Items */}
              <div className="w-full space-y-2">
                <button
                  className="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => { setMobileMenuOpen(false); navigate('/settings'); }}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 2.25c.38-1.13 2.12-1.13 2.5 0a1.5 1.5 0 0 0 2.12.88c1.06-.61 2.31.64 1.7 1.7a1.5 1.5 0 0 0 .88 2.12c1.13.38 1.13 2.12 0 2.5a1.5 1.5 0 0 0-.88 2.12c.61 1.06-.64 2.31-1.7 1.7a1.5 1.5 0 0 0-2.12.88c-.38 1.13-2.12 1.13-2.5 0a1.5 1.5 0 0 0-2.12-.88c-1.06.61-2.31-.64-1.7-1.7a1.5 1.5 0 0 0-.88-2.12c-1.13-.38-1.13-2.12 0-2.5a1.5 1.5 0 0 0 .88-2.12c-.61-1.06.64-2.31 1.7-1.7a1.5 1.5 0 0 0 2.12-.88Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Settings
                </button>
                <button
                  className="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
                  </svg>
                  Profile
                </button>
                <button
                  className="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => changeCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
                >
                  {currentTheme === 'light' ? (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                    </svg>
                  )}
                  {currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full">
              <hr className="mb-4 border-t border-gray-200 dark:border-gray-700 w-full" />
              <button
                className="w-full text-left font-medium text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center py-3 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={handleLogout}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
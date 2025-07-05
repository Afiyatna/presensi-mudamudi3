import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from '../supabaseClient';
import SidebarLinkGroup from "./SidebarLinkGroup";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
  children,
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

  // Ambil role user
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

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/dashboard" className="block">
            <img src="/logo.jpg" alt="Logo" className="mx-auto h-12 w-auto" />
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Pages</span>
            </h3>
            <ul className="mt-3">
              {/* Dashboard */}
              <li className="px-3 py-2">
                <NavLink
                  end
                  to="/dashboard"
                  className={({ isActive }) =>
                    "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " +
                    (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                  }
                  onClick={() => setSidebarExpanded(true)}
                >
                  <div className="flex items-center gap-2">
                    <svg className={`shrink-0 fill-current ${pathname === "/dashboard" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                      <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                    </svg>
                    <span className="text-sm font-medium duration-200">
                      Dashboard
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Menu dinamis sesuai role */}
              {role === 'admin' && (
                <>
                  {/* QR Scanner */}
                  <li className="px-3 py-2">
                <NavLink
                  end
                      to="/qr-scanner"
                      className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/qr-scanner" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h3A1.5 1.5 0 0 1 6 1.5v3A1.5 1.5 0 0 1 4.5 6h-3A1.5 1.5 0 0 1 0 4.5v-3ZM1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3ZM0 10.5A1.5 1.5 0 0 1 1.5 9h3A1.5 1.5 0 0 1 6 10.5v3A1.5 1.5 0 0 1 4.5 15h-3A1.5 1.5 0 0 1 0 13.5v-3ZM1.5 10a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3ZM10 1.5A1.5 1.5 0 0 1 11.5 0h3A1.5 1.5 0 0 1 16 1.5v3A1.5 1.5 0 0 1 14.5 6h-3A1.5 1.5 0 0 1 10 4.5v-3ZM11.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3ZM10 10.5A1.5 1.5 0 0 1 11.5 9h3A1.5 1.5 0 0 1 16 10.5v3A1.5 1.5 0 0 1 14.5 15h-3A1.5 1.5 0 0 1 10 13.5v-3ZM11.5 10a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3Z"/>
                    </svg>
                        <span className="text-sm font-medium duration-200">
                          QR Scanner Menu
                    </span>
                  </div>
                </NavLink>
              </li>
                  {/* Riwayat Presensi Menu */}
                  <li className="px-3 py-2">
                    <NavLink
                      end
                      to="/attendance-report-menu"
                      className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-blue-700" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/attendance-report-menu" ? 'text-blue-700' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M8 1.333A6.667 6.667 0 1 0 8 14.667 6.667 6.667 0 0 0 8 1.333zm0 12A5.333 5.333 0 1 1 8 2.667a5.333 5.333 0 0 1 0 10.666zm0-8A2.667 2.667 0 1 0 8 10.667 2.667 2.667 0 0 0 8 5.333z"/>
                        </svg>
                        <span className="text-sm font-medium duration-200">
                          Rekap Presensi Menu
                        </span>
                      </div>
                    </NavLink>
                  </li>
                  {/* Rekap Presensi */}
                  {/* <li className="px-3 py-2">
                            <NavLink
                              end
                      to="/attendance-report"
                              className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/attendance-report" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                          <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                        </svg>
                        <span className="text-sm font-medium duration-200">
                          Rekap Presensi
                              </span>
                      </div>
                            </NavLink>
                          </li> */}
                  {/* Dashboard Dummy */}
                  <li className="px-3 py-2">
                    <NavLink
                      end
                      to="/dashboard-dummy"
                      className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/dashboard-dummy" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M0 0h16v16H0z" fill="none"/>
                          <path d="M2 13h12V3H2v10zm1-9h10v8H3V4zm2 2h2v2H5V6zm0 3h2v2H5V9zm3-3h2v2H8V6zm0 3h2v2H8V9z"/>
                        </svg>
                        <span className="text-sm font-medium duration-200">
                          Dashboard Dummy
                        </span>
                      </div>
                    </NavLink>
                  </li>
                  {/* Rekap Presensi Dummy */}
                  <li className="px-3 py-2">
                    <NavLink
                      end
                      to="/rekap-presensi-dummy"
                      className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/rekap-presensi-dummy" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M2 2h12v12H2z" fill="none"/>
                          <path d="M4 4h8v1H4zm0 2h8v1H4zm0 2h8v1H4zm0 2h8v1H4z"/>
                        </svg>
                        <span className="text-sm font-medium duration-200">
                          Rekap Presensi Dummy
                        </span>
                      </div>
                    </NavLink>
                  </li>
                </>
              )}
              {role === 'user' && (
                <>
                  {/* QR Code */}
                  <li className="px-3 py-2">
                            <NavLink
                              end
                      to="/user-qr"
                              className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/user-qr" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M2 2h2v2H2V2zm1 1h1V3H3v1zm2-1h2v2H5V2zm1 1h1V3H6v1zm2-1h2v2H8V2zm1 1h1V3H9v1zm2-1h2v2h-2V2zm1 1h1V3h-1v1zM2 5h2v2H2V5zm1 1h1V6H3v1zm2-1h2v2H5V5zm1 1h1V6H6v1zm2-1h2v2H8V5zm1 1h1V6H9v1zm2-1h2v2h-2V5zm1 1h1V6h-1v1zM2 8h2v2H2V8zm1 1h1V9H3v1zm2-1h2v2H5V8zm1 1h1V9H6v1zm2-1h2v2H8V8zm1 1h1V9H9v1zm2-1h2v2h-2V8zm1 1h1V9h-1v1zM2 11h2v2H2v-2zm1 1h1v-1H3v1zm2-1h2v2H5v-2zm1 1h1v-1H6v1zm2-1h2v2H8v-2zm1 1h1v-1H9v1zm2-1h2v2h-2v-2zm1 1h1v-1h-1v1z"/>
                            </svg>
                        <span className="text-sm font-medium duration-200">
                          QR Code
                              </span>
                      </div>
                            </NavLink>
                          </li>
                  {/* Riwayat Presensi */}
                  <li className="px-3 py-2">
                            <NavLink
                              end
                      to="/user-history"
                              className={({ isActive }) =>
                        "block text-gray-800 dark:text-gray-100 truncate transition duration-150 " + (isActive ? "text-violet-500" : "hover:text-gray-900 dark:hover:text-white")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`shrink-0 fill-current ${pathname === "/user-history" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                          <path d="M8 3.293l-6 6V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9.293l-6-6zm5 9.207a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V9.707l5-5 5 5V12.5z"/>
                          <path d="M7.5 10.5v-3h1v3h-1zm0 2v-1h1v1h-1z"/>
                        </svg>
                        <span className="text-sm font-medium duration-200">
                          Riwayat Presensi
                              </span>
                      </div>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

import React from "react";

export default function Footer({ className = "", variant = "full" }) {
  // Minimal footer for landing pages (login/register)
  if (variant === "minimal") {
    return (
      <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700/60 ${className}`}>
        <div className="mx-auto w-full max-w-screen-xl px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Generus Muda Kendal. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Powered by PPG Daerah Kendal</span>
            </div>
            <div className="flex flex-col items-center space-y-1 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">Partner</span>
              <div className="flex items-center space-x-3">
                <a href="https://afiyatna.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs transition-colors">
                  Afiyatna
                </a>
                <span className="text-gray-400 dark:text-gray-600 text-xs">•</span>
                <a href="https://www.abuabdirohman.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs transition-colors">
                  Abu Abdirohman
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for authenticated pages
  return (
    <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700/60 ${className}`}>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/logo.jpg" className="h-10 w-auto mr-3 rounded-lg" alt="Logo" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Generus Muda Kendal
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Sistem Presensi Digital
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md text-justify">
              Platform presensi digital yang memudahkan pengelolaan kehadiran peserta pengajian 
              dengan teknologi QR Code yang aman dan terpercaya.
            </p>
          </div>

          {/* Social Media */}
            <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Social Media
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://www.instagram.com/generusmuda/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @generusmuda
                  </a>
                </li>
              </ul>
            </div>

          {/* Support & Contact */}
            <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Support & Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span className="font-medium">generusmudakendal@gmail.com</span>
                </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Kendal, Jawa Tengah</span>
                </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span className="font-medium">+62 821 1234 5678</span>
                </li>
              </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700/60">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Generus Muda Kendal. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Powered by PPG Daerah Kendal</span>
            </div>
            <div className="flex flex-col items-center space-y-1 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">Partner</span>
              <div className="flex items-center space-x-3">
                <a href="https://afiyatna.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs transition-colors">
                  Afiyatna
                </a>
                <span className="text-gray-400 dark:text-gray-600 text-xs">•</span>
                <a href="https://www.abuabdirohman.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs transition-colors">
                  Abu Abdirohman
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { supabase } from '../supabaseClient';

function QRScannerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [presensiLoading, setPresensiLoading] = useState(false);
  const qrId = 'qr-reader';
  const qrRef = useRef();
  const html5QrInstance = useRef(null);

  const handleScanPresensi = async (userId) => {
    setPresensiLoading(true);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nama_lengkap, kelompok, desa')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      alert('Data user tidak ditemukan!');
      setPresensiLoading(false);
      return;
    }

    const now = new Date();
    const batasJam = 7;
    const status = (now.getHours() < batasJam || (now.getHours() === batasJam && now.getMinutes() === 0))
      ? 'hadir'
      : 'terlambat';

    const { error: presensiError } = await supabase.from('presensi').insert([{
      nama_lengkap: profile.nama_lengkap,
      kelompok: profile.kelompok,
      desa: profile.desa,
      status: status,
    }]);

    setPresensiLoading(false);
    if (presensiError) {
      alert('Gagal menyimpan presensi!');
    } else {
      alert(`Presensi berhasil! Status: ${status}`);
    }
  };

  useEffect(() => {
    if (scanning && qrRef.current && qrRef.current.childNodes.length === 0) {
      if (html5QrInstance.current) {
        try { html5QrInstance.current.stop(); } catch (e) {}
        try { html5QrInstance.current.clear(); } catch (e) {}
      }
      qrRef.current.innerHTML = '';
      const qr = new Html5Qrcode(qrId);
      html5QrInstance.current = qr;
      qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setScanResult(decodedText);
          const scanData = {
            id: Date.now(),
            text: decodedText,
            timestamp: new Date().toLocaleString('id-ID'),
            type: 'success',
          };
          setScanHistory((prev) => [scanData, ...prev.slice(0, 9)]);
          setScanning(false);
          try { qr.stop(); } catch (e) {}
          await handleScanPresensi(decodedText);
        },
        (error) => {}
      );
    }
    return () => {
      if (html5QrInstance.current) {
        try { html5QrInstance.current.stop(); } catch (e) {}
        try { html5QrInstance.current.clear(); } catch (e) {}
      }
    };
  }, [scanning]);

  const startScanner = () => {
    setScanResult('');
    setScanning(true);
  };

  const stopScanner = () => {
    setScanning(false);
    if (html5QrInstance.current) {
      try { html5QrInstance.current.stop(); } catch (e) {}
      try { html5QrInstance.current.clear(); } catch (e) {}
    }
    if (qrRef.current) {
      const video = qrRef.current.querySelector('video');
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                QR Scanner Presensi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Scan QR Code untuk melakukan presensi masuk atau keluar
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* QR Scanner Section */}
              <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Scanner QR Code
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Arahkan kamera ke QR Code untuk memulai presensi
                  </p>
                </div>
                {/* QR Scanner Container */}
                <div className="flex justify-center mb-6">
                  <div
                    id={qrId}
                    ref={qrRef}
                    className="w-full max-w-md"
                    style={{ minHeight: '300px' }}
                  ></div>
                </div>
                {/* Scanner Controls */}
                <div className="flex gap-3 justify-center">
                  {scanning ? (
                    <button
                      onClick={stopScanner}
                      className="btn bg-red-500 hover:bg-red-600 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Matikan Scanner
                    </button>
                  ) : (
                    <button
                      onClick={startScanner}
                      className="btn bg-violet-500 hover:bg-violet-600 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Mulai Scan
                    </button>
                  )}
                </div>
                {/* Last Scan Result */}
                {scanResult && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Hasil Scan Terakhir:
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 break-all">
                      {scanResult}
                    </p>
                  </div>
                )}
              </div>

              {/* Scan History Section */}
              <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Riwayat Scan
                  </h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Bersihkan
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Belum ada riwayat scan</p>
                    </div>
                  ) : (
                    scanHistory.map((scan) => (
                      <div
                        key={scan.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {scan.text}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {scan.timestamp}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Berhasil
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                Cara Menggunakan QR Scanner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium mr-3 mt-0.5">
                    1
                  </span>
                  <p>Pastikan QR Code terlihat jelas dan tidak terhalang</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium mr-3 mt-0.5">
                    2
                  </span>
                  <p>Arahkan kamera ke QR Code dan tunggu hingga terdeteksi</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium mr-3 mt-0.5">
                    3
                  </span>
                  <p>Sistem akan otomatis memproses presensi setelah QR Code terdeteksi</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default QRScannerPage; 
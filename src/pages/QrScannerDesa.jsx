import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const beepUrl = '/beep.mp3';

// Fungsi util localStorage untuk anti double scan 1 jam (letakkan di luar komponen)
const getLastScanTimesDesa = () => {
  try {
    return JSON.parse(localStorage.getItem('lastScanTimesDesa') || '{}');
  } catch {
    return {};
  }
};
const setLastScanTimeDesa = (userId, timestamp) => {
  const data = getLastScanTimesDesa();
  data[userId] = timestamp;
  localStorage.setItem('lastScanTimesDesa', JSON.stringify(data));
};

export default function QrScannerDesa() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [presensiLoading, setPresensiLoading] = useState(false);
  const [jamTepatWaktu, setJamTepatWaktu] = useState('07:00');
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [lastScannedId, setLastScannedId] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scannerError, setScannerError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successStatus, setSuccessStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const qrId = 'qr-reader-desa';
  const qrRef = useRef();
  const html5QrInstance = useRef(null);
  const navigate = useNavigate();
  const beepAudio = useRef(null);

  useEffect(() => {
    beepAudio.current = new window.Audio(beepUrl);
  }, []);

  useEffect(() => {
    const fetchJamTepatWaktu = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'jam_tepat_waktu')
        .single();
      if (data) setJamTepatWaktu(data.value);
    };
    fetchJamTepatWaktu();
  }, []);

  const handleScanPresensi = async (userId) => {
    setPresensiLoading(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama_lengkap, kelompok, desa, jenis_kelamin')
      .eq('id', userId)
      .single();
    if (!profile) {
      toast.error('Data user tidak ditemukan!');
      setPresensiLoading(false);
      return '';
    }
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const waktuPresensi = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+07:00`;
    const [batasJam, batasMenit] = jamTepatWaktu.split(':').map(Number);
    const status = (now.getHours() < batasJam || (now.getHours() === batasJam && now.getMinutes() <= batasMenit))
      ? 'hadir'
      : 'terlambat';
    const { error: presensiError } = await supabase.from('presensi_desa').insert([{
      nama_lengkap: profile.nama_lengkap,
      kelompok: profile.kelompok,
      desa: profile.desa,
      jenis_kelamin: profile.jenis_kelamin,
      status: status,
      waktu_presensi: waktuPresensi,
    }]);
    setPresensiLoading(false);
    if (presensiError) {
      toast.error('Gagal menyimpan presensi desa!');
    } else {
      toast.success(`Presensi desa berhasil! Status: ${status}`);
    }
    return status;
  };

  const startScanner = async () => {
    setScanResult('');
    setScannerError('');
    if (html5QrInstance.current) {
      try { await html5QrInstance.current.stop(); } catch (e) {}
      try { await html5QrInstance.current.clear(); } catch (e) {}
    }
    if (qrRef.current) qrRef.current.innerHTML = '';
    const qr = new Html5Qrcode(qrId);
    html5QrInstance.current = qr;
    try {
      await qr.start(
        { facingMode: cameraFacing },
        { fps: 10, qrbox: 250, rememberLastUsedCamera: true },
        async (decodedText) => {
          try {
            const now = Date.now();
            const lastScanTimes = getLastScanTimesDesa();
            if (lastScanTimes[decodedText] && now - lastScanTimes[decodedText] < 3600_000) {
              toast('QR sudah di-scan, tunggu 1 jam sebelum scan lagi.', { icon: '⏳' });
              return false;
            }
            setLastScanTimeDesa(decodedText, now);
            setLastScannedId(decodedText);
            setLastScanTime(now);
            setScanResult(decodedText);
            const scanData = {
              id: Date.now(),
              text: decodedText,
              timestamp: new Date().toLocaleString('id-ID'),
              type: 'success',
            };
            setScanHistory((prev) => [scanData, ...prev.slice(0, 9)]);
            if (beepAudio.current) beepAudio.current.play();
            const status = await handleScanPresensi(decodedText);
            setSuccessStatus(status);
            setSuccessMessage(`Presensi telah berhasil: ${status}`);
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
            }, 2000);
          } catch (e) {
            console.error('Scan callback error:', e);
          }
        },
        (error) => {
          setScannerError('Gagal mengakses kamera atau scanner error. Coba restart scanner.');
        }
      );
    } catch (e) {
      setScannerError('Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.');
    }
  };

  const stopScanner = async () => {
    setScanning(false);
    if (html5QrInstance.current) {
      try { await html5QrInstance.current.stop(); } catch (e) {}
      try { await html5QrInstance.current.clear(); } catch (e) {}
    }
    if (qrRef.current) qrRef.current.innerHTML = '';
  };

  useEffect(() => {
    if (scanning && !showSuccess) {
      startScanner();
    } else if (!scanning && !showSuccess) {
      stopScanner();
    }
    // eslint-disable-next-line
  }, [scanning, cameraFacing, showSuccess]);

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="QR Scanner Presensi Desa" />
        <main className="grow">
          <Toaster position="top-right" />
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate('/qr-scanner')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-all">← Kembali</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* QR Scanner Section */}
              <div className="bg-white shadow-xs rounded-xl p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-green-700 mb-2">
                    Scanner QR Code
                  </h2>
                  <p className="text-sm text-gray-600">
                    Arahkan kamera ke QR Code untuk memulai presensi desa
                  </p>
                </div>
                {/* QR Scanner Controls */}
                <div className="flex gap-2 justify-center mb-4">
                  <button
                    className={`btn ${cameraFacing === 'environment' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setCameraFacing('environment')}
                    type="button"
                  >
                    Kamera Belakang
                  </button>
                  <button
                    className={`btn ${cameraFacing === 'user' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setCameraFacing('user')}
                    type="button"
                  >
                    Kamera Depan
                  </button>
                </div>
                <div className="flex justify-center mb-6">
                  {!showSuccess && (
                    <div
                      ref={qrRef}
                      id={qrId}
                      className="w-full max-w-md rounded-xl border-2 border-green-200 shadow-lg flex items-center justify-center min-h-[300px] bg-white"
                      style={{ minHeight: '300px' }}
                    />
                  )}
                  {showSuccess && (
                    <div className="w-full max-w-md rounded-xl border-2 border-green-200 shadow-lg flex flex-col items-center justify-center min-h-[300px] bg-white animate-fade-in">
                      <div className={`text-5xl mb-2 ${successStatus === 'hadir' ? 'text-green-500' : 'text-red-500'} animate-bounce`}>{successStatus === 'hadir' ? '✅' : '⏰'}</div>
                      <div className={`text-xl font-bold ${successStatus === 'hadir' ? 'text-green-600' : 'text-red-600'} mb-1`}>{successMessage}</div>
                      <div className="text-gray-500 animate-pulse">Menyiapkan scanner berikutnya...</div>
                    </div>
                  )}
                </div>
                {/* Scanner Controls */}
                <div className="flex gap-3 justify-center">
                  {scanning ? (
                    <>
                      <button
                        onClick={stopScanner}
                        className="btn bg-red-500 hover:bg-red-600 text-white"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Matikan Scanner
                      </button>
                      <button
                        onClick={startScanner}
                        className="btn bg-green-200 hover:bg-green-300 text-green-700"
                      >
                        Restart Scanner
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setScanning(true)}
                      className="btn bg-green-600 hover:bg-green-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Mulai Scan
                    </button>
                  )}
                </div>
                {/* Error Scanner */}
                {scannerError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                    {scannerError}
                  </div>
                )}
                {/* Loading Spinner */}
                {presensiLoading && (
                  <div className="flex justify-center items-center mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    <span className="ml-2 text-green-600">Menyimpan presensi...</span>
                  </div>
                )}
                {/* Last Scan Result */}
                {scanResult && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      Hasil Scan Terakhir:
                    </h3>
                    <p className="text-sm text-green-700 break-all">
                      {scanResult}
                    </p>
                  </div>
                )}
              </div>
              {/* Scan History Section */}
              <div className="bg-white shadow-xs rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-green-700">
                    Riwayat Scan
                  </h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Bersihkan
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Belum ada riwayat scan</p>
                    </div>
                  ) : (
                    scanHistory.map((scan) => (
                      <div
                        key={scan.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {scan.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {scan.timestamp}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Cara Menggunakan QR Scanner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-medium mr-3 mt-0.5">
                    1
                  </span>
                  <p>Pastikan QR Code terlihat jelas dan tidak terhalang</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-medium mr-3 mt-0.5">
                    2
                  </span>
                  <p>Arahkan kamera ke QR Code dan tunggu hingga terdeteksi</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-medium mr-3 mt-0.5">
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
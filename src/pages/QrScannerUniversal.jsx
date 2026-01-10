import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { presensiKegiatanService } from '../lib/presensiKegiatanService';
import LayoutDashboard from '../layouts/LayoutDashboard';
import { toast } from 'react-hot-toast';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

const beepUrl = '/beep.mp3'; // letakkan beep.mp3 di public folder project Anda

export default function QrScannerUniversal() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [kegiatan, setKegiatan] = useState(null);
  const qrId = 'qr-reader-universal';
  const qrRef = useRef();
  const html5QrInstance = useRef(null);
  const beepAudio = useRef(null);

  useEffect(() => {
    beepAudio.current = new window.Audio(beepUrl);
  }, []);

  useEffect(() => {
    // Ambil data kegiatan dari state navigasi
    if (location.state?.kegiatanId) {
      fetchKegiatanData(location.state.kegiatanId);
    } else {
      toast.error('Data kegiatan tidak ditemukan');
      navigate('/kegiatan');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchJamTepatWaktu = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'jam_tepat_waktu')
          .single();

        if (error && error.code === 'PGRST116') {
          // Data tidak ditemukan, buat data default
          const { error: insertError } = await supabase
            .from('settings')
            .insert({ key: 'jam_tepat_waktu', value: '07:00' });

          if (!insertError) {
            setJamTepatWaktu('07:00');
          }
        } else if (data) {
          setJamTepatWaktu(data.value);
        }
      } catch (error) {
        console.error('Error fetching jam tepat waktu:', error);
        setJamTepatWaktu('07:00'); // Fallback default
      }
    };
    fetchJamTepatWaktu();
  }, []);

  const fetchKegiatanData = async (kegiatanId) => {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('id', kegiatanId)
        .single();

      if (error) throw error;
      setKegiatan(data);
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      toast.error('Gagal memuat data kegiatan');
      navigate('/kegiatan');
    }
  };

  const handleSaveJamTepatWaktu = async () => {
    try {
      console.log('Attempting to save jam tepat waktu:', jamTepatWaktu);

      // Cek apakah data sudah ada
      const { data: existingData, error: checkError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'jam_tepat_waktu')
        .single();

      console.log('Existing data check:', { existingData, checkError });

      let result;
      if (checkError && checkError.code === 'PGRST116') {
        // Data tidak ada, insert baru
        console.log('Inserting new jam tepat waktu');
        result = await supabase
          .from('settings')
          .insert({ key: 'jam_tepat_waktu', value: jamTepatWaktu });
      } else {
        // Data sudah ada, update
        console.log('Updating existing jam tepat waktu');
        result = await supabase
          .from('settings')
          .update({ value: jamTepatWaktu })
          .eq('key', 'jam_tepat_waktu');
      }

      console.log('Save result:', result);

      if (result.error) {
        console.error('Error saving jam tepat waktu:', result.error);
        toast.error(`Gagal menyimpan jam tepat waktu: ${result.error.message}`);
      } else {
        toast.success('Jam tepat waktu berhasil diupdate!');
        // Refresh data dari database untuk memastikan konsistensi
        const { data, error: fetchError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'jam_tepat_waktu')
          .single();

        if (fetchError) {
          console.error('Error fetching updated jam tepat waktu:', fetchError);
        } else if (data) {
          setJamTepatWaktu(data.value);
          console.log('Updated jam tepat waktu state:', data.value);
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleSaveJamTepatWaktu:', error);
      toast.error(`Terjadi kesalahan saat menyimpan jam tepat waktu: ${error.message}`);
    }
  };

  // Helper function to refresh session if needed
  const refreshSessionIfNeeded = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        // If there's an error getting session, try to get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Session expired. Silakan login kembali.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return false;
        }
        return true;
      }
      if (!session) {
        // No session, try to get user (might trigger auto-refresh)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Session expired. Silakan login kembali.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return false;
        }
        return true;
      }
      // Check if session is expired (within 5 minutes of expiry)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
        if (expiresIn < 300) { // Less than 5 minutes
          // Try to refresh
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(session);
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
            toast.error('Session expired. Silakan login kembali.');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
            return false;
          }
          return refreshData?.session ? true : false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking session:', error);
      // Try one more time with getUser
      try {
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
      } catch (e) {
        toast.error('Session expired. Silakan login kembali.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return false;
      }
    }
  };

  const handleScanPresensi = async (qrData) => {
    setPresensiLoading(true);
    console.log('[QR Process] Starting presensi process for QR Data:', qrData);

    try {
      // Refresh session before making API calls
      const sessionValid = await refreshSessionIfNeeded();
      if (!sessionValid) {
        console.error('[QR Process] Session invalid or expired');
        setPresensiLoading(false);
        return '';
      }

      // Parse QR code data: user_id|nama|kelompok|desa|kategori
      const parts = qrData.split('|');
      console.log('[QR Process] Parsed data parts:', parts);
      const [userId, nama, kelompok, desa, kategori] = parts;

      if (!userId || !nama || !kelompok || !desa) {
        console.error('[QR Process] Invalid QR Format. Data:', qrData);
        toast.error('Format QR Code tidak valid');
        setPresensiLoading(false);
        return '';
      }

      // Check if user already has presensi for this kegiatan
      console.log(`[QR Process] Checking existing presensi for UserID: ${userId}, KegiatanID: ${kegiatan.id}`);
      const existingPresensi = await presensiKegiatanService.getPresensiByUserAndKegiatan(userId, kegiatan.id);
      console.log('[QR Process] Existing presensi result:', existingPresensi);

      if (existingPresensi.error) {
        console.error('[QR Process] Error checking existing presensi:', existingPresensi.error);
        // Check if it's an auth error
        if (existingPresensi.error.message?.includes('JWT') || existingPresensi.error.message?.includes('token') || existingPresensi.error.message?.includes('session')) {
          toast.error('Session expired. Silakan login kembali.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          setPresensiLoading(false);
          return '';
        }
        toast.error('Gagal memeriksa presensi: ' + existingPresensi.error.message);
        setPresensiLoading(false);
        return '';
      }

      if (existingPresensi.data && existingPresensi.data.length > 0) {
        console.warn('[QR Process] User already present:', existingPresensi.data);
        toast.error('User sudah melakukan presensi untuk kegiatan ini');
        setPresensiLoading(false);
        return '';
      }

      // Get user profile data
      console.log('[QR Process] Fetching user profile for:', userId);
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userProfile) {
        console.log('[QR Process] User profile found:', userProfile);
      }

      if (userError) {
        console.error('[QR Process] Error fetching user profile:', userError);
        // Check if it's an auth error
        if (userError.message?.includes('JWT') || userError.message?.includes('token') || userError.message?.includes('session')) {
          toast.error('Session expired. Silakan login kembali.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          setPresensiLoading(false);
          return '';
        }
        toast.error('Data user tidak ditemukan: ' + userError.message);
        setPresensiLoading(false);
        return '';
      }

      // Determine status based on time
      const now = new Date();
      const [batasJam, batasMenit] = jamTepatWaktu.split(':').map(Number);
      const status = (now.getHours() < batasJam || (now.getHours() === batasJam && now.getMinutes() <= batasMenit))
        ? 'hadir'
        : 'terlambat';

      // Create presensi record
      const presensiData = {
        kegiatan_id: kegiatan.id,
        user_id: userId,
        nama_lengkap: nama,
        kelompok: kelompok,
        desa: desa,
        jenis_kelamin: userProfile.jenis_kelamin || 'Tidak diketahui',
        status: status,
        waktu_presensi: now.toISOString()
      };

      const { data: newPresensi, error: presensiError } = await presensiKegiatanService.createPresensiKegiatan(presensiData);

      if (presensiError) {
        console.error('[QR Process] Error creating presensi record:', presensiError);
        // Check if it's an auth error
        if (presensiError.message?.includes('JWT') || presensiError.message?.includes('token') || presensiError.message?.includes('session')) {
          toast.error('Session expired. Silakan login kembali.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          setPresensiLoading(false);
          return '';
        }
        toast.error('Gagal mencatat presensi: ' + presensiError.message);
        setPresensiLoading(false);
        return '';
      }

      console.log('[QR Process] Presensi created successfully:', newPresensi);

      toast.success(`Presensi berhasil! ${nama} - Status: ${status}`);
      setPresensiLoading(false);
      return status;

    } catch (error) {
      console.error('Error processing presensi:', error);
      // Check if it's an auth error
      if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('session') || error.message?.includes('refresh')) {
        toast.error('Session expired. Silakan login kembali.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error('Gagal memproses presensi: ' + error.message);
      }
      setPresensiLoading(false);
      return '';
    }
  };

  const startScanner = async () => {
    setScanResult('');
    setScannerError('');
    if (html5QrInstance.current) {
      try { await html5QrInstance.current.stop(); } catch (e) { }
      try { await html5QrInstance.current.clear(); } catch (e) { }
    }
    if (qrRef.current) qrRef.current.innerHTML = '';
    const qr = new Html5Qrcode(qrId);
    html5QrInstance.current = qr;
    try {
      await qr.start(
        { facingMode: cameraFacing },
        {
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
          disableFlip: false
        },
        async (decodedText) => {
          try {
            setLastScannedId(decodedText);
            setLastScanTime(Date.now());
            setScanResult(decodedText);
            const scanData = {
              id: Date.now(),
              text: decodedText,
              timestamp: new Date().toLocaleString('id-ID'),
              type: 'success',
            };
            setScanHistory((prev) => [scanData, ...prev.slice(0, 9)]);
            if (beepAudio.current) {
              try {
                beepAudio.current.play().catch(e => console.log('Audio play error:', e));
              } catch (e) {
                console.log('Audio error:', e);
              }
            }

            // Stop scanner immediately after successful scan
            await stopScanner();

            const status = await handleScanPresensi(decodedText);
            if (status) {
              setSuccessStatus(status);
              setSuccessMessage(`Presensi berhasil! Status: ${status}`);
              setShowSuccess(true);

              // Auto restart scanner after 3 seconds
              setTimeout(() => {
                setShowSuccess(false);
                setScanning(true);
              }, 3000);
            }
          } catch (e) {
            console.error('Scan callback error:', e);
            toast.error('Error saat memproses scan: ' + e.message);
          }
        },
        (errorMessage) => {
          // html5-qrcode standardly calls this callback for every frame where it fails to detect a QR code.
          // This is NOT usually a critical error, just "not found yet".

          let errorStr = '';
          if (typeof errorMessage === 'string') {
            errorStr = errorMessage;
          } else if (errorMessage.message) {
            errorStr = errorMessage.message;
          } else {
            errorStr = JSON.stringify(errorMessage);
          }

          // Check for common temporary scanning errors that we should ignore
          const isCommonError =
            errorStr.includes('NotFound') ||
            errorStr.includes('No QR code') ||
            errorStr.includes('No MultiFormat Readers') ||
            errorStr.includes('e.indexOf is not a function'); // Sometimes happens in internal library logic

          if (!isCommonError) {
            console.error('[QR Scanner Error] Critical error:', errorMessage);
            setScannerError('Gagal mengakses kamera atau scanner error. Pastikan izin kamera sudah diberikan dan coba restart scanner.');
          } else {
            // Optional: console.debug('[QR Scanner] Frame scan failed (normal):', errorStr);
          }
        }
      );
    } catch (e) {
      console.error('Scanner start error:', e);
      let errorMessage = 'Gagal mengakses kamera. ';
      if (e.message?.includes('Permission denied') || e.message?.includes('NotAllowedError')) {
        errorMessage += 'Izin kamera ditolak. Silakan berikan izin kamera di pengaturan browser.';
      } else if (e.message?.includes('NotFoundError') || e.message?.includes('No camera')) {
        errorMessage += 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.';
      } else {
        errorMessage += 'Pastikan izin kamera sudah diberikan dan coba restart scanner.';
      }
      setScannerError(errorMessage);
    }
  };

  const stopScanner = async () => {
    setScanning(false);
    if (html5QrInstance.current) {
      try { await html5QrInstance.current.stop(); } catch (e) { }
      try { await html5QrInstance.current.clear(); } catch (e) { }
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

  if (!kegiatan) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data kegiatan...</p>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/kegiatan')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-all">← Kembali</button>
        </div>

        {/* Deskripsi halaman */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h1 className="text-xl font-bold text-blue-800 mb-2">
            QR Scanner: {kegiatan.nama_kegiatan} ({kegiatan.kategori_kegiatan || 'Kelompok'})
          </h1>
          <p className="text-blue-700 text-sm text-justify">
            Halaman ini memungkinkan admin untuk memindai QR Code peserta untuk mencatat presensi kegiatan {kegiatan.kategori_kegiatan || 'Kelompok'}.
            Sistem akan otomatis menentukan status kehadiran berdasarkan waktu presensi dan batas waktu yang ditentukan.
            Kamera akan otomatis mati setelah scan berhasil untuk menghindari scan berulang.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner Section */}
          <div className="bg-white shadow-xs rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">
                Scanner QR Code
              </h2>
              <p className="text-sm text-gray-600">
                Arahkan kamera ke QR Code untuk memulai presensi {kegiatan.kategori_kegiatan || 'Kelompok'}
              </p>
            </div>
            {presensiLoading && <DataLoadingSpinner message="Memproses presensi..." />}
            {/* Pengaturan Jam Tepat Waktu */}
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="jamTepatWaktu" className="text-sm font-medium text-gray-700">Jam Tepat Waktu:</label>
              <input
                id="jamTepatWaktu"
                type="time"
                value={jamTepatWaktu}
                onChange={e => setJamTepatWaktu(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={handleSaveJamTepatWaktu}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Simpan
              </button>
            </div>
            {/* QR Scanner Controls */}
            <div className="flex gap-2 justify-center mb-4">
              <button
                className={`btn ${cameraFacing === 'environment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setCameraFacing('environment')}
                type="button"
              >
                Kamera Belakang
              </button>
              <button
                className={`btn ${cameraFacing === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
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
                  className="w-full max-w-md rounded-xl border-2 border-blue-200 shadow-lg flex items-center justify-center min-h-[300px] bg-white"
                  style={{ minHeight: '300px' }}
                />
              )}
              {showSuccess && (
                <div className="w-full max-w-md rounded-xl border-2 border-blue-200 shadow-lg flex flex-col items-center justify-center min-h-[300px] bg-white animate-fade-in">
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
                    className="btn bg-blue-200 hover:bg-blue-300 text-blue-700"
                  >
                    Restart Scanner
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setScanning(true)}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white"
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
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-blue-600">Menyimpan presensi...</span>
              </div>
            )}
            {/* Last Scan Result */}
            {scanResult && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Hasil Scan Terakhir:
                </h3>
                <p className="text-sm text-blue-700 break-all">
                  {scanResult}
                </p>
              </div>
            )}
          </div>
          {/* Scan History Section */}
          <div className="bg-white shadow-xs rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-blue-700">
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Cara Menggunakan QR Scanner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-medium mr-3 mt-0.5">
                1
              </span>
              <p>Pastikan QR Code terlihat jelas dan tidak terhalang</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-medium mr-3 mt-0.5">
                2
              </span>
              <p>Arahkan kamera ke QR Code dan tunggu hingga terdeteksi</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-medium mr-3 mt-0.5">
                3
              </span>
              <p>Kamera akan otomatis mati setelah scan berhasil dan akan restart dalam 3 detik</p>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
} 
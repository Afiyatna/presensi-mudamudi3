import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import LayoutDashboard from '../layouts/LayoutDashboard';
import jsPDF from 'jspdf';
import DataLoadingSpinner from '../components/DataLoadingSpinner';
import ScanSuccessModal from '../components/ScanSuccessModal';
import RealtimeStatus from '../components/RealtimeStatus';
import RealtimeTest from '../components/RealtimeTest';

export default function UserQRCode() {
  const [userId, setUserId] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successStatus, setSuccessStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const qrRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        // Ambil nama lengkap dari profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama_lengkap')
          .eq('id', data.user.id)
          .single();
        if (profile?.nama_lengkap) setNamaLengkap(profile.nama_lengkap);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  // Real-time subscription untuk presensi daerah
  useEffect(() => {
    if (!userId || !namaLengkap) {
      console.log('UserQRCode: Waiting for userId and namaLengkap', { userId, namaLengkap });
      return;
    }

    console.log('UserQRCode: Setting up real-time subscriptions for', namaLengkap);

    const presensiDaerahSubscription = supabase
      .channel('presensi_daerah_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'presensi_daerah'
        },
        (payload) => {
          console.log('UserQRCode: Received presensi daerah event:', payload.new);
          console.log('UserQRCode: Comparing', payload.new.nama_lengkap, 'with', namaLengkap);
          
          // Filter berdasarkan nama_lengkap
          if (payload.new.nama_lengkap === namaLengkap) {
            console.log('UserQRCode: Match found! Showing notification for daerah');
            showPresensiSuccess(payload.new.status, 'daerah');
          } else {
            console.log('UserQRCode: No match for daerah notification');
          }
        }
      )
      .subscribe((status) => {
        console.log('UserQRCode: Daerah subscription status:', status);
      });

    // Real-time subscription untuk presensi desa
    const presensiDesaSubscription = supabase
      .channel('presensi_desa_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'presensi_desa'
        },
        (payload) => {
          console.log('UserQRCode: Received presensi desa event:', payload.new);
          console.log('UserQRCode: Comparing', payload.new.nama_lengkap, 'with', namaLengkap);
          
          // Filter berdasarkan nama_lengkap
          if (payload.new.nama_lengkap === namaLengkap) {
            console.log('UserQRCode: Match found! Showing notification for desa');
            showPresensiSuccess(payload.new.status, 'desa');
          } else {
            console.log('UserQRCode: No match for desa notification');
          }
        }
      )
      .subscribe((status) => {
        console.log('UserQRCode: Desa subscription status:', status);
      });

    return () => {
      console.log('UserQRCode: Cleaning up subscriptions');
      presensiDaerahSubscription.unsubscribe();
      presensiDesaSubscription.unsubscribe();
    };
  }, [userId, namaLengkap]);

  const showPresensiSuccess = (status, jenis) => {
    console.log('UserQRCode: showPresensiSuccess called with', { status, jenis });
    setSuccessStatus(status);
    setSuccessMessage(`Presensi ${jenis} Anda telah berhasil dicatat dengan status: ${status === 'hadir' ? 'Hadir' : 'Terlambat'}`);
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessStatus('');
    setSuccessMessage('');
  };

  const getSafeFileName = (name, ext) => {
    if (!name) return `qr-code.${ext}`;
    return `${name.replace(/\s+/g, '_')}_qr-code.${ext}`;
  };

  const handleDownloadJPG = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = url;
    link.download = getSafeFileName(namaLengkap, 'jpg');
    link.click();
  };

  const handleExportPDF = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/jpeg');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [300, 400] });
    pdf.text('QR Code Presensi Anda', 20, 30);
    pdf.addImage(imgData, 'JPEG', 20, 50, 256, 256);
    pdf.save(getSafeFileName(namaLengkap, 'pdf'));
  };

  if (loading) return <DataLoadingSpinner message="Memuat QR Code..." />;

  if (!userId) return <div>Anda belum login.</div>;

  return (
    <LayoutDashboard pageTitle="QR Code">
      {/* Scan Success Modal */}
      <ScanSuccessModal
        isVisible={showSuccessModal}
        status={successStatus}
        message={successMessage}
        onClose={handleCloseSuccessModal}
      />
      
      {/* Realtime Status Indicator */}
      <RealtimeStatus />
      
      {/* Realtime Test Component (for debugging) */}
      <RealtimeTest namaLengkap={namaLengkap} />
      
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">QR Code Presensi Anda</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          QR Code ini adalah identitas digital Anda untuk melakukan presensi. 
          Tunjukkan QR Code ini kepada admin saat kegiatan pengajian untuk mencatat kehadiran Anda. 
          Anda dapat mengunduh QR Code dalam format JPG atau PDF untuk digunakan offline.
        </p>
        <div ref={qrRef}>
          <QRCodeCanvas value={userId} size={256} />
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={handleDownloadJPG} className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700">Download JPG</button>
          <button onClick={handleExportPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export PDF</button>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            <strong>Petunjuk:</strong> Tunjukkan QR Code ini ke admin untuk melakukan presensi
          </p>
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 text-center">
            <strong>Notifikasi Aktif:</strong> Anda akan menerima notifikasi langsung ketika QR Code di-scan
          </p>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 text-center">
            <strong>Debug Info:</strong> Nama: {namaLengkap} | User ID: {userId}
          </p>
        </div>
      </div>
    </LayoutDashboard>
  );
} 
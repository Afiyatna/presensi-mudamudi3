import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import LayoutDashboard from '../layouts/LayoutDashboard';
import jsPDF from 'jspdf';
import DataLoadingSpinner from '../components/DataLoadingSpinner';

export default function UserQRCode() {
  const [userId, setUserId] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [desa, setDesa] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        // Ambil nama lengkap, kelompok, dan desa dari profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama_lengkap, kelompok, desa')
          .eq('id', data.user.id)
          .single();
        if (profile?.nama_lengkap) setNamaLengkap(profile.nama_lengkap);
        if (profile?.kelompok) setKelompok(profile.kelompok);
        if (profile?.desa) setDesa(profile.desa);
        
        // Format QR code: userId|nama|kelompok|desa (sesuai dengan format yang diharapkan scanner)
        const qrCodeValue = `${data.user.id}|${profile?.nama_lengkap || ''}|${profile?.kelompok || ''}|${profile?.desa || ''}`;
        setQrValue(qrCodeValue);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const getSafeFileName = (name, ext) => {
    if (!name) return `qr-code.${ext}`;
    return `${name.replace(/\s+/g, '_')}_qr-code.${ext}`;
  };

  const truncateLabel = (text, max = 25) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max - 3)}...` : text;
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const composeQrWithInfo = () => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) return null;

    // Card dimensions (portrait)
    const cardWidth = 360;
    const cardHeight = 500;
    const qrSize = 220;
    const topPadding = 32;
    const gapAfterQr = 28;

    const canvas = document.createElement('canvas');
    canvas.width = cardWidth;
    canvas.height = cardHeight;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Card border shadow hint (simple outline to balance space)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, cardWidth - 20, cardHeight - 20);

    // QR centered
    const qrX = (cardWidth - qrSize) / 2;
    ctx.drawImage(qrCanvas, qrX, topPadding, qrSize, qrSize);

    // Text section with boxed labels and character limit
    const boxWidth = cardWidth - 80;
    const boxHeight = 40;
    const textStartY = topPadding + qrSize + gapAfterQr;
    const center = cardWidth / 2;
    ctx.textAlign = 'center';

    // Nama box
    const nameBoxX = (cardWidth - boxWidth) / 2;
    const nameBoxY = textStartY - boxHeight / 2;
    drawRoundedRect(ctx, nameBoxX, nameBoxY, boxWidth, boxHeight, 10);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillText(truncateLabel(namaLengkap || 'Nama belum diisi', 28), center, nameBoxY + boxHeight / 2 + 5);

    // Kelompok box
    const groupBoxY = nameBoxY + boxHeight + 12;
    drawRoundedRect(ctx, nameBoxX, groupBoxY, boxWidth, boxHeight, 10);
    ctx.fillStyle = '#eef2ff';
    ctx.fill();
    ctx.strokeStyle = '#c7d2fe';
    ctx.stroke();
    ctx.fillStyle = '#4f46e5';
    ctx.font = '14px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillText(truncateLabel(kelompok || 'Belum ada kelompok'), center, groupBoxY + boxHeight / 2 + 4);

    return canvas;
  };

  const handleDownloadJPG = () => {
    const canvas = composeQrWithInfo();
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = url;
    link.download = getSafeFileName(namaLengkap, 'jpg');
    link.click();
  };

  const handleExportPDF = () => {
    const canvas = composeQrWithInfo();
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/jpeg');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [canvas.width + 40, canvas.height + 80] });
    pdf.text('QR Code Presensi Anda', 20, 30);
    pdf.addImage(imgData, 'JPEG', 20, 50, canvas.width, canvas.height);
    pdf.text(`Nama: ${namaLengkap || '-'}`, 20, 60 + canvas.height);
    pdf.text(`Kelompok: ${kelompok || '-'}`, 20, 80 + canvas.height);
    pdf.save(getSafeFileName(namaLengkap, 'pdf'));
  };

  if (loading) return <DataLoadingSpinner message="Memuat QR Code..." />;

  // if (loading) {
  //   return (
  //     <LayoutDashboard>
  //       <div className="max-w-4xl mx-auto py-8 px-4">
  //         <div className="flex items-center justify-center py-12">
  //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  //           <span className="ml-3 text-gray-600">Memuat data...</span>
  //         </div>
  //       </div>
  //     </LayoutDashboard>
  //   );
  // }
  if (!userId) return <div>Anda belum login.</div>;

  return (
    <LayoutDashboard pageTitle="QR Code">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">QR Code Presensi Anda</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-2xl">
          QR Code ini adalah identitas digital Anda untuk melakukan presensi.
          Tunjukkan QR Code ini kepada admin saat kegiatan pengajian untuk mencatat kehadiran Anda.
          Anda dapat mengunduh QR Code dalam format JPG atau PDF untuk digunakan offline.
        </p>

        <div className="w-full max-w-xl">
          <div className="mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-md">
            <div className="flex justify-center mb-5">
              <div ref={qrRef} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                <QRCodeCanvas value={qrValue || userId} size={240} />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{namaLengkap || 'Nama belum diisi'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kelompok</p>
                <p className="text-lg font-medium text-indigo-600 dark:text-indigo-300">{kelompok || 'Belum ada kelompok'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadJPG}
                className="w-full bg-violet-600 text-white px-4 py-2.5 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Download JPG
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-200 text-center">
              <strong>Petunjuk:</strong> Tunjukkan QR Code ini ke admin untuk melakukan presensi.
            </p>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
} 
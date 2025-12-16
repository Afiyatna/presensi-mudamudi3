import React, { useMemo } from 'react';

const StatistikKegiatan = ({ presensiList, kegiatan }) => {
  // Hitung statistik
  const statistik = useMemo(() => {
    if (!presensiList || presensiList.length === 0) {
      return {
        total: 0,
        hadir: 0,
        terlambat: 0,
        izin: 0,
        persentaseHadir: 0,
        persentaseTerlambat: 0,
        persentaseIzin: 0
      };
    }

    const total = presensiList.length;
    const hadir = presensiList.filter(p => p.status === 'hadir').length;
    const terlambat = presensiList.filter(p => p.status === 'terlambat').length;
    const izin = presensiList.filter(p => p.status === 'izin').length;

    return {
      total,
      hadir,
      terlambat,
      izin,
      persentaseHadir: total > 0 ? Math.round((hadir / total) * 100) : 0,
      persentaseTerlambat: total > 0 ? Math.round((terlambat / total) * 100) : 0,
      persentaseIzin: total > 0 ? Math.round((izin / total) * 100) : 0
    };
  }, [presensiList]);

  // Statistik berdasarkan kelompok
  const statistikKelompok = useMemo(() => {
    if (!presensiList || presensiList.length === 0) return [];

    const kelompokMap = {};
    presensiList.forEach(presensi => {
      const kelompok = presensi.kelompok || 'Tidak Ada Kelompok';
      if (!kelompokMap[kelompok]) {
        kelompokMap[kelompok] = { total: 0, hadir: 0, terlambat: 0, izin: 0 };
      }
      kelompokMap[kelompok].total++;
      kelompokMap[kelompok][presensi.status]++;
    });

    return Object.entries(kelompokMap).map(([nama, data]) => ({
      nama,
      ...data,
      persentaseHadir: Math.round((data.hadir / data.total) * 100)
    }));
  }, [presensiList]);

  // Statistik berdasarkan desa
  const statistikDesa = useMemo(() => {
    if (!presensiList || presensiList.length === 0) return [];

    const desaMap = {};
    presensiList.forEach(presensi => {
      const desa = presensi.desa || 'Tidak Ada Desa';
      if (!desaMap[desa]) {
        desaMap[desa] = { total: 0, hadir: 0, terlambat: 0, izin: 0 };
      }
      desaMap[desa].total++;
      desaMap[desa][presensi.status]++;
    });

    return Object.entries(desaMap).map(([nama, data]) => ({
      nama,
      ...data,
      persentaseHadir: Math.round((data.hadir / data.total) * 100)
    }));
  }, [presensiList]);

  if (!kegiatan) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Pilih Kegiatan</div>
        <div className="text-gray-400 dark:text-gray-500 text-sm">Klik salah satu kegiatan untuk melihat statistik</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Statistik Presensi: {kegiatan.nama_kegiatan}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Ringkasan data presensi kegiatan
        </p>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Presensi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {statistik.total}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Total Presensi</div>
        </div>

        {/* Hadir */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {statistik.hadir}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Hadir</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {statistik.persentaseHadir}%
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            {statistik.terlambat}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Terlambat</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            {statistik.persentaseTerlambat}%
          </div>
        </div>

        {/* Izin */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {statistik.izin}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Izin</div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            {statistik.persentaseIzin}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Persentase Kehadiran
        </h3>
        <div className="space-y-4">
          {/* Hadir */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Hadir</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statistik.persentaseHadir}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${statistik.persentaseHadir}%` }}
              ></div>
            </div>
          </div>

          {/* Terlambat */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Terlambat</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statistik.persentaseTerlambat}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${statistik.persentaseTerlambat}%` }}
              ></div>
            </div>
          </div>

          {/* Izin */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Izin</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statistik.persentaseIzin}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${statistik.persentaseIzin}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistik Kelompok */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Statistik per Kelompok
          </h3>
          <div className="space-y-3">
            {statistikKelompok.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {item.nama}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.total} anggota
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {item.persentaseHadir}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.hadir}/{item.total} hadir
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistik Desa */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Statistik per Desa
          </h3>
          <div className="space-y-3">
            {statistikDesa.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {item.nama}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.total} anggota
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {item.persentaseHadir}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.hadir}/{item.total} hadir
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Tambahan */}
      {statistik.total === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📊</div>
          <div className="text-gray-500 dark:text-gray-400">
            Belum ada data presensi untuk kegiatan ini
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistikKegiatan; 
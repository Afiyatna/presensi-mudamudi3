import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';
import LayoutDashboard from '../layouts/LayoutDashboard';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

// Temp client configuration to create users without logging out the admin
const supabaseUrl = 'https://gwshtmfpdndlljifbloa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c2h0bWZwZG5kbGxqaWZibG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjkyMzQsImV4cCI6MjA2NzEwNTIzNH0.6f32ea-ePZh_byij9d11WWj6PcERg4RgjWUULKleix0';

export default function BatchCreateUser() {
    const [data, setData] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });
    const [logs, setLogs] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const jsonData = XLSX.utils.sheet_to_json(ws);
            setData(jsonData);
            toast.success(`Berhasil membaca ${jsonData.length} data user`);
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const template = [
            {
                email: 'user1@example.com',
                password: 'Password123!',
                nama_lengkap: 'User Satu',
                jenis_kelamin: 'Laki-Laki',
                tempat_lahir: 'Kendal',
                tanggal_lahir: '2000-01-01',
                kelompok: 'PESAWAHAN',
                desa: 'KENDAL',
                kategori: 'Muda - Mudi'
            },
            {
                email: 'user2@example.com',
                password: 'Password123!',
                nama_lengkap: 'User Dua',
                jenis_kelamin: 'Perempuan',
                tempat_lahir: 'Semarang',
                tanggal_lahir: '1995-05-20',
                kelompok: 'BRANGSONG',
                desa: 'BRANGSONG',
                kategori: 'Orang Tua'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "template_batch_user_v2.xlsx");
    };

    const processBatch = async () => {
        if (data.length === 0) return;

        // Create a temporary client that doesn't persist session
        // This allows us to signUp new users without affecting the current admin session
        const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            }
        });

        setProcessing(true);
        setLogs([]);
        setProgress({ current: 0, total: data.length, success: 0, fail: 0 });

        let successCount = 0;
        let failCount = 0;
        const newLogs = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { email, password, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, kelompok, desa, kategori } = row;

            setProgress(prev => ({ ...prev, current: i + 1 }));

            try {
                if (!email || !password) {
                    throw new Error('Email dan Password wajib diisi');
                }

                // 1. Create Auth User
                const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                    email,
                    password: String(password),
                });

                if (authError) throw authError;

                const userId = authData.user?.id;
                if (!userId) throw new Error('Gagal mendapatkan User ID');

                // 2. Insert Profile (using main admin client for RLS permissions)
                const { error: profileError } = await supabase.from('profiles').insert([
                    {
                        id: userId,
                        email, // redundan tapi ada di schema profiles
                        nama_lengkap,
                        jenis_kelamin,
                        tempat_lahir,
                        tanggal_lahir: typeof tanggal_lahir === 'number'
                            ? new Date((tanggal_lahir - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0] // Handle Excel serial date
                            : tanggal_lahir,
                        kelompok,
                        desa,
                        role: 'user', // Default role
                        kategori: kategori || 'Muda - Mudi' // Default category
                    }
                ]);

                if (profileError) {
                    // Optional: Delete auth user if profile creation fails?
                    // For now, just log it.
                    throw new Error(`Profile creation failed: ${profileError.message}`);
                }

                successCount++;
                newLogs.push({ type: 'success', message: `Berhasil: ${email} (${nama_lengkap})` });

            } catch (error) {
                failCount++;
                newLogs.push({ type: 'error', message: `Gagal: ${email} - ${error.message}` });
            }

            setProgress(prev => ({ ...prev, success: successCount, fail: failCount }));
            setLogs([...newLogs]);
        }

        setProcessing(false);
        toast.success(`Proses selesai. Sukses: ${successCount}, Gagal: ${failCount}`);
    };

    return (
        <LayoutDashboard pageTitle="Batch Create User">
            <div className="p-4 pb-32 min-h-screen flex flex-col">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Batch Create Users</h1>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">1. Download Template & Upload</h2>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <button
                            onClick={downloadTemplate}
                            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 font-medium transition"
                        >
                            Download Template Excel
                        </button>
                        <div className="flex-1 w-full">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-50 file:text-violet-700
                      hover:file:bg-violet-100
                    "
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Pastikan format file sesuai template. Kolom <code>kategori</code> harus diisi 'Muda - Mudi' atau 'Orang Tua'.
                    </p>
                </div>

                {data.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">2. Preview Data ({data.length} rows)</h2>
                            <button
                                onClick={processBatch}
                                disabled={processing}
                                className={`px-6 py-2 rounded-lg font-bold text-white transition ${processing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 shadow-md'
                                    }`}
                            >
                                {processing ? 'Memproses...' : 'Mulai Proses Batch'}
                            </button>
                        </div>

                        {processing && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between text-sm mt-1 text-gray-600 dark:text-gray-300">
                                    <span>Progress: {progress.current} / {progress.total}</span>
                                    <span>Sukses: <span className="text-green-600 font-bold">{progress.success}</span> | Gagal: <span className="text-red-500 font-bold">{progress.fail}</span></span>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto flex-1 max-h-96 border rounded-lg">
                            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2">No</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Nama</th>
                                        <th className="px-4 py-2">Kategori</th>
                                        <th className="px-4 py-2">Kelompok</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => {
                                        // Check if this row has a log entry
                                        const log = logs[index]; // Note: logs might not match index perfectly if async pushed, but here we rebuild logs array purely.
                                        // Actually better strategies exist, but for simple preview, let's just show raw data.
                                        // For status, we can check if index < progress.current

                                        let status = 'Pending';
                                        let rowClass = '';
                                        if (index < progress.current) {
                                            // This is a naive heuristic since logs are appended. Ideally match by email.
                                            // Assuming sequential processing:
                                            if (index < logs.length) {
                                                status = logs[index].type === 'success' ? 'Sukses' : 'Gagal';
                                                rowClass = logs[index].type === 'success' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10';
                                            }
                                        }

                                        return (
                                            <tr key={index} className={`border-b dark:border-gray-700 ${rowClass}`}>
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{row.email}</td>
                                                <td className="px-4 py-2">{row.nama_lengkap}</td>
                                                <td className="px-4 py-2">{row.kategori}</td>
                                                <td className="px-4 py-2">{row.kelompok}</td>
                                                <td className="px-4 py-2">
                                                    {status === 'Sukses' && <span className="text-green-600 font-bold">✓ OK</span>}
                                                    {status === 'Gagal' && <span className="text-red-500 font-bold">✗ {logs[index]?.message.split('-')[1]}</span>}
                                                    {status === 'Pending' && <span className="text-gray-400">Pending</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Logs Console */}
                {logs.length > 0 && (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-inner h-48 overflow-y-auto font-mono text-xs">
                        {logs.map((log, idx) => (
                            <div key={idx} className={log.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                                [{log.type.toUpperCase()}] {log.message}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </LayoutDashboard>
    );
}

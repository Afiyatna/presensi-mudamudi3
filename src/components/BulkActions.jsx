import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function BulkActions({ 
  selectedItems, 
  onBulkDelete, 
  onBulkExport, 
  onBulkStatusChange,
  itemType = 'presensi',
  showStatusChange = false,
  statusOptions = []
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error(`Pilih ${itemType} yang akan dihapus`);
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} ${itemType} yang dipilih?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkDelete(selectedItems);
      toast.success(`${selectedItems.length} ${itemType} berhasil dihapus`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error(`Gagal menghapus ${itemType}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedItems.length === 0) {
      toast.error(`Pilih ${itemType} yang akan diexport`);
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkExport(selectedItems);
      toast.success(`Export ${selectedItems.length} ${itemType} berhasil`);
    } catch (error) {
      console.error('Error bulk exporting:', error);
      toast.error(`Gagal export ${itemType}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedItems.length === 0) {
      toast.error(`Pilih ${itemType} yang akan diubah statusnya`);
      return;
    }

    if (!selectedStatus) {
      toast.error('Pilih status baru');
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkStatusChange(selectedItems, selectedStatus);
      toast.success(`Status ${selectedItems.length} ${itemType} berhasil diubah`);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error bulk status change:', error);
      toast.error(`Gagal mengubah status ${itemType}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {selectedItems.length} {itemType} dipilih
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Change Dropdown */}
          {showStatusChange && statusOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusChange}
                disabled={isProcessing || !selectedStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
              >
                {isProcessing ? 'Memproses...' : 'Ubah Status'}
              </button>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleBulkExport}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
          >
            {isProcessing ? 'Memproses...' : 'Export'}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleBulkDelete}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
          >
            {isProcessing ? 'Memproses...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
} 
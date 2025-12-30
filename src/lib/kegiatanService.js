import { supabase } from '../supabaseClient';

// Kegiatan Service
export const kegiatanService = {
  // Get all kegiatan
  async getAllKegiatan() {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      return { data: null, error };
    }
  },

  // Get kegiatan by ID
  async getKegiatanById(id) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching kegiatan by ID:', error);
      return { data: null, error };
    }
  },

  // Create new kegiatan
  async createKegiatan(kegiatanData) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .insert([kegiatanData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating kegiatan:', error);
      return { data: null, error };
    }
  },

  // Update kegiatan
  async updateKegiatan(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating kegiatan:', error);
      return { data: null, error };
    }
  },

  // Delete kegiatan
  async deleteKegiatan(id) {
    try {
      // First delete related presensi records
      const { error: presensiError } = await supabase
        .from('presensi_kegiatan')
        .delete()
        .eq('kegiatan_id', id);

      if (presensiError) throw presensiError;

      // Then delete the kegiatan
      const { error } = await supabase
        .from('kegiatan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting kegiatan:', error);
      return { error };
    }
  },

  // Get kegiatan by status
  async getKegiatanByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('status', status)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching kegiatan by status:', error);
      return { data: null, error };
    }
  },

  // Get kegiatan by date range
  async getKegiatanByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching kegiatan by date range:', error);
      return { data: null, error };
    }
  },

  // Get kegiatan by kategori
  async getKegiatanByKategori(kategori) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('kategori_kegiatan', kategori)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching kegiatan by kategori:', error);
      return { data: null, error };
    }
  },

  // Get kegiatan by multiple kategori
  async getKegiatanByMultipleKategori(kategoriList) {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .in('kategori_kegiatan', kategoriList)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching kegiatan by multiple kategori:', error);
      return { data: null, error };
    }
  },

  // Get all kategori kegiatan yang tersedia
  async getAvailableKategoriKegiatan() {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('kategori_kegiatan')
        .not('kategori_kegiatan', 'is', null);

      if (error) throw error;

      // Get unique kategori values
      const uniqueKategori = [...new Set(data.map(item => item.kategori_kegiatan))];
      return { data: uniqueKategori, error: null };
    } catch (error) {
      console.error('Error fetching available kategori kegiatan:', error);
      return { data: null, error };
    }
  },

  // Validate kategori kegiatan
  validateKategoriKegiatan(kategori) {
    const validKategori = ['Daerah', 'Desa', 'Kelompok'];
    return validKategori.includes(kategori);
  }
}; 
import { supabase } from '../supabaseClient';

// Presensi Kegiatan Service
// Presensi Kegiatan Service
export const presensiKegiatanService = {
  // Get all presensi kegiatan
  async getAllPresensiKegiatan() {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .select(`
          *,
          kegiatan: kegiatan_id (
            nama_kegiatan,
            tanggal,
            jam_mulai,
            lokasi
          ),
          user: user_id (
            nama_lengkap,
            kelompok,
            desa,
            jenis_kelamin,
            kategori
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching presensi kegiatan:', error);
      return { data: null, error };
    }
  },

  // Get presensi by kegiatan ID
  async getPresensiByKegiatanId(kegiatanId) {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .select(`
          *,
          kegiatan: kegiatan_id (
            nama_kegiatan,
            tanggal,
            jam_mulai,
            lokasi
          ),
          user: user_id (
            nama_lengkap,
            kelompok,
            desa,
            jenis_kelamin,
            kategori
          )
        `)
        .eq('kegiatan_id', kegiatanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching presensi by kegiatan ID:', error);
      return { data: null, error };
    }
  },

  // Alias for getPresensiByKegiatanId
  async getPresensiByKegiatan(kegiatanId) {
    return this.getPresensiByKegiatanId(kegiatanId);
  },

  // Get presensi by user ID
  async getPresensiByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .select(`
          *,
          kegiatan: kegiatan_id (
            nama_kegiatan,
            tanggal,
            jam_mulai,
            lokasi
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching presensi by user ID:', error);
      return { data: null, error };
    }
  },

  // Create new presensi
  async createPresensi(presensiData) {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .insert([presensiData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating presensi:', error);
      return { data: null, error };
    }
  },

  // Update presensi
  async updatePresensi(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating presensi:', error);
      return { data: null, error };
    }
  },

  // Delete presensi
  async deletePresensi(id) {
    try {
      const { error } = await supabase
        .from('presensi_kegiatan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting presensi:', error);
      return { error };
    }
  },

  // Bulk delete presensi
  async bulkDeletePresensi(ids) {
    try {
      const { error } = await supabase
        .from('presensi_kegiatan')
        .delete()
        .in('id', ids);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error bulk deleting presensi:', error);
      return { error };
    }
  },

  // Get presensi statistics
  async getPresensiStats(kegiatanId = null) {
    try {
      let query = supabase
        .from('presensi_kegiatan')
        .select('status, kegiatan_id');

      if (kegiatanId) {
        query = query.eq('kegiatan_id', kegiatanId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data.length,
        hadir: data.filter(p => p.status === 'hadir').length,
        terlambat: data.filter(p => p.status === 'terlambat').length,
        izin: data.filter(p => p.status === 'izin').length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching presensi stats:', error);
      return { data: null, error };
    }
  },

  // Get presensi by date range
  async getPresensiByDateRange(startDate, endDate, kegiatanId = null) {
    try {
      let query = supabase
        .from('presensi_kegiatan')
        .select(`
          *,
          kegiatan: kegiatan_id (
            nama_kegiatan,
            tanggal,
            jam_mulai,
            lokasi
          ),
          user: user_id (
            nama_lengkap,
            kelompok,
            desa,
            jenis_kelamin,
            kategori
          )
        `)
        .gte('waktu_presensi', startDate)
        .lte('waktu_presensi', endDate);

      if (kegiatanId) {
        query = query.eq('kegiatan_id', kegiatanId);
      }

      const { data, error } = await query.order('waktu_presensi', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching presensi by date range:', error);
      return { data: null, error };
    }
  },

  // Get presensi by user ID and kegiatan ID
  async getPresensiByUserAndKegiatan(userId, kegiatanId) {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .select('*')
        .eq('user_id', userId)
        .eq('kegiatan_id', kegiatanId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching presensi by user and kegiatan:', error);
      return { data: null, error };
    }
  },

  // Create new presensi kegiatan
  async createPresensiKegiatan(presensiData) {
    try {
      const { data, error } = await supabase
        .from('presensi_kegiatan')
        .insert([presensiData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating presensi kegiatan:', error);
      return { data: null, error };
    }
  }
}; 
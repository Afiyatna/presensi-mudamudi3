import { supabase } from '../supabaseClient';

// Izin Kegiatan Service
export const izinKegiatanService = {
  // Get all izin kegiatan
  async getAllIzinKegiatan() {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
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
            jenis_kelamin
          ),
          approver: approved_by (
            nama_lengkap
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching izin kegiatan:', error);
      return { data: null, error };
    }
  },

  // Get izin by status
  async getIzinByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
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
            jenis_kelamin
          ),
          approver: approved_by (
            nama_lengkap
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching izin by status:', error);
      return { data: null, error };
    }
  },

  // Get izin by user ID
  async getIzinByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
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
      console.error('Error fetching izin by user ID:', error);
      return { data: null, error };
    }
  },

  // Get izin by kegiatan ID
  async getIzinByKegiatanId(kegiatanId) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
        .select(`
          *,
          user: user_id (
            nama_lengkap,
            kelompok,
            desa,
            jenis_kelamin
          ),
          approver: approved_by (
            nama_lengkap
          )
        `)
        .eq('kegiatan_id', kegiatanId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching izin by kegiatan ID:', error);
      return { data: null, error };
    }
  },

  // Create new izin
  async createIzin(izinData) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
        .insert([izinData])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating izin:', error);
      return { data: null, error };
    }
  },

  // Update izin
  async updateIzin(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating izin:', error);
      return { data: null, error };
    }
  },

  // Approve izin
  async approveIzin(id, approverId) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error approving izin:', error);
      return { data: null, error };
    }
  },

  // Reject izin
  async rejectIzin(id, approverId) {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error rejecting izin:', error);
      return { data: null, error };
    }
  },

  // Bulk approve izin
  async bulkApproveIzin(ids, approverId) {
    try {
      const { error } = await supabase
        .from('izin_kegiatan')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .in('id', ids);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error bulk approving izin:', error);
      return { error };
    }
  },

  // Bulk reject izin
  async bulkRejectIzin(ids, approverId) {
    try {
      const { error } = await supabase
        .from('izin_kegiatan')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .in('id', ids);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error bulk rejecting izin:', error);
      return { error };
    }
  },

  // Delete izin
  async deleteIzin(id) {
    try {
      const { error } = await supabase
        .from('izin_kegiatan')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting izin:', error);
      return { error };
    }
  },

  // Get izin statistics
  async getIzinStats() {
    try {
      const { data, error } = await supabase
        .from('izin_kegiatan')
        .select('status');
      
      if (error) throw error;
      
      // Calculate statistics
      const stats = {
        total: data.length,
        pending: data.filter(i => i.status === 'pending').length,
        approved: data.filter(i => i.status === 'approved').length,
        rejected: data.filter(i => i.status === 'rejected').length
      };
      
      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching izin stats:', error);
      return { data: null, error };
    }
  }
}; 
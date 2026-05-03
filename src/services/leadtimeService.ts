import { supabase } from '../lib/supabase';

export interface LeadTimeData {
  id: number;
  tanggal: string;
  area: string;
  no_polisi: string;
  no_lambung: string;
  driver: string;
  assistant: string;
  shift: string;
  ritase_ke: string;
  checkpoints: Record<string, any>;
  status_info: Record<string, any>;
  keterangan_umum: string;
  driver_id: string;
}

export const leadtimeService = {
  async getLeadTimes(startDate?: string, endDate?: string, area?: string) {
    let query = supabase
      .from('leadtimes')
      .select('*')
      .order('tanggal', { ascending: false });

    if (startDate) query = query.gte('tanggal', startDate);
    if (endDate) query = query.lte('tanggal', endDate);
    if (area && area !== 'ALL') query = query.eq('area', area);

    const { data, error } = await query;
    if (error) throw error;
    return data as LeadTimeData[];
  }
};

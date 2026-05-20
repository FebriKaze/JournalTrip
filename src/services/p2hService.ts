import { supabase } from '../lib/supabase';
import { P2HRecord } from '../types';

/**
 * Menyimpan data P2H ke database Supabase
 */
export async function saveP2H(data: Omit<P2HRecord, 'id' | 'created_at'>): Promise<{ success: boolean; data?: P2HRecord; error?: any }> {
  try {
    const { data: result, error } = await supabase
      .from('p2h')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving P2H:', error);
    return { success: false, error };
  }
}

/**
 * Mengambil data P2H hari ini untuk daftar driver
 */
export async function fetchP2HToday(date: string): Promise<Record<string, P2HRecord>> {
  try {
    const { data, error } = await supabase
      .from('p2h')
      .select('*')
      .eq('tanggal', date);

    if (error) throw error;

    const p2hMap: Record<string, P2HRecord> = {};
    if (data) {
      data.forEach((item: P2HRecord) => {
        // Jika driver diperiksa berkali-kali di hari yang sama, ambil yang terbaru
        // Supabase mengembalikan data berdasarkan urutan insert secara default,
        // tapi aman-nya kita override
        p2hMap[item.driver_id] = item;
      });
    }

    return p2hMap;
  } catch (error) {
    console.error('Error fetching P2H today:', error);
    return {};
  }
}

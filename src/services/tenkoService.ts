import { supabase } from '../lib/supabase';

export interface TenkoRecord {
  id: string;
  tanggal: string;
  timestamp: string;
  driver_id: string;
  driver_name?: string;
  nopol: string;
  no_lambung: string;
  tensi: string;
  sistolik: number;
  diastolik: number;
  denyut_nadi: number;
  suhu_tubuh: number;
  alkohol: string;
  mata: string;
  fatigue: string;
  oxygen_saturation: number;
  rest_time: number;
}

export interface TenkoSummary {
  totalCheckups: number;
  tensi: {
    normal: number;
    hipertensi: number;
    hipotensi: number;
  };
  suhu: {
    normal: number;
    demam: number;
  };
  alkohol: {
    negatif: number;
    positif: number;
  };
  fatigue: {
    normal: number;
    lelah: number;
  };
  raw: TenkoRecord[];
}

/**
 * Fetch Tenko records for a specific date range and area
 */
export async function fetchTenkoData(startDate: string, endDate: string, area: string = 'ALL') {
  try {
    let query = supabase
      .from('tenko')
      .select(`
        *,
        drivers!inner(name, area)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    if (area !== 'ALL') {
      query = query.eq('drivers.area', area);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;

    const records: TenkoRecord[] = data.map(item => ({
      ...item,
      driver_name: item.drivers.name
    }));

    // Calculate Summary
    const summary: TenkoSummary = {
      totalCheckups: records.length,
      tensi: { normal: 0, hipertensi: 0, hipotensi: 0 },
      suhu: { normal: 0, demam: 0 },
      alkohol: { negatif: 0, positif: 0 },
      fatigue: { normal: 0, lelah: 0 },
      raw: records
    };

    records.forEach(r => {
      // Tensi Logic (JNC 7 criteria simplified)
      if (r.sistolik >= 140 || r.diastolik >= 90) summary.tensi.hipertensi++;
      else if (r.sistolik < 90 || r.diastolik < 60) summary.tensi.hipotensi++;
      else summary.tensi.normal++;

      // Suhu Logic
      if (r.suhu_tubuh >= 37.5) summary.suhu.demam++;
      else summary.suhu.normal++;

      // Alkohol Logic
      if (r.alkohol === '0%' || r.alkohol?.toLowerCase().includes('negatif')) summary.alkohol.negatif++;
      else summary.alkohol.positif++;

      // Fatigue Logic
      if (r.fatigue?.toUpperCase() === 'NORMAL') summary.fatigue.normal++;
      else summary.fatigue.lelah++;
    });

    return summary;
  } catch (error) {
    console.error('Error fetching tenko data:', error);
    return null;
  }
}

/**
 * Fetch Daily Trend for Tenko
 */
export async function fetchTenkoTrend(startDate: string, endDate: string, area: string = 'ALL') {
  try {
    let query = supabase
      .from('tenko')
      .select(`
        tanggal,
        sistolik,
        diastolik,
        drivers!inner(area)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    if (area !== 'ALL') {
      query = query.eq('drivers.area', area);
    }

    const { data, error } = await query;
    if (error) throw error;

    const dailyMap: Record<string, any> = {};
    
    data.forEach(item => {
      const date = item.tanggal;
      if (!dailyMap[date]) {
        dailyMap[date] = { date, normal: 0, hipertensi: 0, hipotensi: 0, total: 0 };
      }
      
      const sis = item.sistolik;
      const dia = item.diastolik;
      
      if (sis >= 140 || dia >= 90) dailyMap[date].hipertensi++;
      else if (sis < 90 || dia < 60) dailyMap[date].hipotensi++;
      else dailyMap[date].normal++;
      
      dailyMap[date].total++;
    });

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching tenko trend:', error);
    return [];
  }
}

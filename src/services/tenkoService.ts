import { supabase } from '../lib/supabase';

export interface TenkoRecord {
  id: string;
  tanggal: string;
  timestamp: string;
  driver_id: string;
  nama_driver: string; // Ambil langsung dari tabel tenko
  nopol: string;
  no_lambung: string;
  tensi: string;
  sistolik: number;
  diastolik: number;
  denyut_nadi: number;
  suhu_tubuh: number;
  alkohol: number;
  mata: string;
  fatigue: string;
  oxygen_saturation: number;
  rest_time: number;
  customer: string;
  is_assistant: boolean;
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

export function calculateSummary(records: TenkoRecord[]): TenkoSummary {
  const summary: TenkoSummary = {
    totalCheckups: records.length,
    tensi: { normal: 0, hipertensi: 0, hipotensi: 0 },
    suhu: { normal: 0, demam: 0 },
    alkohol: { negatif: 0, positif: 0 },
    fatigue: { normal: 0, lelah: 0 },
    raw: records
  };

  records.forEach(r => {
    if (r.sistolik >= 140 || r.diastolik >= 90) summary.tensi.hipertensi++;
    else if (r.sistolik < 90 || r.diastolik < 60) summary.tensi.hipotensi++;
    else summary.tensi.normal++;

    if (r.suhu_tubuh >= 37.5) summary.suhu.demam++;
    else summary.suhu.normal++;

    // Jika angka > 0 berarti positif alkohol
    if (Number(r.alkohol) === 0) summary.alkohol.negatif++;
    else summary.alkohol.positif++;

    if (r.fatigue?.toUpperCase() === 'NORMAL') summary.fatigue.normal++;
    else summary.fatigue.lelah++;
  });

  return summary;
}

export async function fetchTenkoData(startDate: string, endDate: string, customer: string = 'ALL') {
  try {
    let query = supabase
      .from('tenko')
      .select('*')
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    if (customer && customer !== 'ALL') {
      query = query.eq('customer', customer);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });
    if (error) throw error;

    const summary = calculateSummary(data as TenkoRecord[]);

    const dailyMap: Record<string, any> = {};
    (data || []).forEach(item => {
      const date = item.tanggal;
      if (!dailyMap[date]) {
        dailyMap[date] = { date, normal: 0, hipertensi: 0, hipotensi: 0, total: 0 };
      }
      const sis = parseInt(item.sistolik) || 0;
      const dia = parseInt(item.diastolik) || 0;
      
      if (sis >= 140 || dia >= 90) dailyMap[date].hipertensi++;
      else if (sis < 90 || dia < 60) dailyMap[date].hipotensi++;
      else dailyMap[date].normal++;
      dailyMap[date].total++;
    });

    return {
      raw: (data as TenkoRecord[]) || [],
      summary: summary,
      trends: Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    console.error('Error fetching tenko data:', error);
    return { raw: [], summary: null, trends: [] };
  }
}

/**
 * Fetch dynamic list of unique customers from the data
 */
export async function fetchUniqueCustomers() {
  try {
    // Panggil fungsi RPC yang kita bikin di Supabase tadi
    const { data, error } = await supabase.rpc('get_unique_customers');
      
    if (error) {
      console.error('RPC Error:', error);
      // Fallback kalau RPC gagal, pakai cara lama tapi limit gedein
      const { data: fallbackData } = await supabase.from('tenko').select('customer').limit(10000);
      const unique = Array.from(new Set((fallbackData || []).map(item => item.customer))).filter(Boolean).sort();
      return ['ALL', ...unique as string[]];
    }
    
    // Hasil dari RPC adalah tabel dengan kolom customer_name
    const customers = (data || []).map((item: any) => item.customer_name).filter(Boolean);
    
    return ['ALL', ...customers];
  } catch (error) {
    return ['ALL'];
  }
}

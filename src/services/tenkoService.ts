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
  area: string;
  nik: string;
  is_assistant: boolean;
  tim_tenko?: string;
  checked_by?: string;
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

export async function fetchTenkoData(startDate: string, endDate: string, customer: string = 'ALL', area: string = 'ALL', personnelType: string = 'ALL') {
  try {
    console.log('Fetching Tenko Data:', { startDate, endDate, customer, area, personnelType });
    let allData: TenkoRecord[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from('tenko')
        .select('*')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('timestamp', { ascending: false })
        .range(from, from + step - 1);

      if (customer && customer !== 'ALL') query = query.eq('customer', customer);
      if (area && area !== 'ALL') query = query.eq('area', area);
      
      // Filter Driver/Assistant di level Database
      if (personnelType === 'DRIVER') query = query.eq('is_assistant', false);
      if (personnelType === 'ASST') query = query.eq('is_assistant', true);

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        // DEBUG: Cek 5 data pertama buat liat status asistennya
        if (from === 0) {
          console.log('Sample Data (is_assistant check):', data.slice(0, 5).map(r => ({
            nama: r.nama_driver,
            id: r.nik, // Kita liat kolom nik-nya
            asst: r.is_assistant,
            asst_type: typeof r.is_assistant
          })));
        }
        allData = [...allData, ...(data as TenkoRecord[])];
        if (data.length < step) hasMore = false;
        else from += step;
      } else {
        hasMore = false;
      }
      
      if (allData.length > 50000) break;
    }

    // Deduplicate records based on driver and exact timestamp to prevent sync script doubling
    const uniqueMap = new Map<string, TenkoRecord>();
    allData.forEach(item => {
      const driverIdentifier = item.driver_id || item.nama_driver || item.nik;
      const uniqueKey = `${driverIdentifier}_${item.timestamp}`;
      uniqueMap.set(uniqueKey, item);
    });
    allData = Array.from(uniqueMap.values());

    console.log('Total Records Fetched (After Deduplication):', allData.length);

    const summary = calculateSummary(allData);
    const dailyMap: Record<string, any> = {};
    allData.forEach(item => {
      const date = item.tanggal;
      if (!dailyMap[date]) {
        dailyMap[date] = { date, normal: 0, hipertensi: 0, hipotensi: 0, total: 0 };
      }
      const sis = parseInt(String(item.sistolik)) || 0;
      const dia = parseInt(String(item.diastolik)) || 0;
      
      if (sis >= 140 || dia >= 90) dailyMap[date].hipertensi++;
      else if (sis < 90 || dia < 60) dailyMap[date].hipotensi++;
      else dailyMap[date].normal++;
      dailyMap[date].total++;
    });

    return {
      raw: allData,
      summary: summary,
      trends: Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    console.error('Error fetching tenko data:', error);
    return { raw: [], summary: null, trends: [] };
  }
}

export async function fetchUniqueAreas() {
  try {
    // Cara terbaik: pakai RPC biar tinggal SELECT DISTINCT
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_unique_areas');
    if (!rpcError && rpcData) {
      const areas = rpcData.map((item: any) => item.area_name).filter(Boolean);
      console.log('Areas via RPC:', areas);
      return ['ALL', ...areas];
    }

    // Fallback: Loop sampe 10 halaman (10.000 baris) biar Bekasi yang ada di baris 6700+ ikut kena
    const foundAreas = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const { data } = await supabase
        .from('tenko')
        .select('area')
        .range(i * 1000, (i + 1) * 1000 - 1);
      
      if (!data || data.length === 0) break;
      data.forEach(d => { if (d.area) foundAreas.add(d.area); });
    }

    const unique = Array.from(foundAreas).filter(Boolean).sort();
    console.log('Areas via Fallback Loop:', unique);
    return ['ALL', ...unique as string[]];
  } catch (error) {
    console.error('fetchUniqueAreas error:', error);
    return ['ALL', 'KARAWANG', 'BEKASI'];
  }
}

/**
 * Fetch dynamic list of unique customers from the data
 */
export async function fetchUniqueCustomers(area: string = 'ALL') {
  try {
    let query = supabase.from('tenko').select('customer');
    
    if (area && area !== 'ALL') {
      query = query.eq('area', area);
    }

    const { data, error } = await query.limit(10000);
    if (error) throw error;
      
    const unique = Array.from(new Set((data || []).map(item => item.customer))).filter(Boolean).sort();
    return ['ALL', ...unique as string[]];
  } catch (error) {
    console.error('Error fetching unique customers:', error);
    return ['ALL'];
  }
}

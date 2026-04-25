import { supabase } from '../lib/supabase';

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface EcoViolation {
  id: number;
  tanggal: string;
  waktu: string;
  plat_nomor: string;
  pengemudi: string;
  driver_id: string | null;
  jenis_peringatan: 'Akselerasi Mendadak' | 'Perlambatan Mendadak' | 'Tikungan Tajam' | 'Kecepatan Melebihi Batas' | string;
  tingkat_urgensi: string;
  detail: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  area: string;
  grup_kendaraan: string;
}

export interface DriverRanking {
  driver: string;
  plat: string;
  driver_id: string | null;
  total: number;
  akselerasi: number;
  perlambatan: number;
  tikungan: number;
  kecepatan: number;
}

export interface ViolationByDate {
  date: string;
  perlambatan: number;
  akselerasi: number;
  tikungan: number;
  kecepatan: number;
}

export interface EcoSummary {
  total: number;
  akselerasi: number;
  perlambatan: number;
  tikungan: number;
  kecepatan: number;
  topDriver: string;
  topDriverTotal: number;
}

// ─── FETCH ALL VIOLATIONS (with optional filters) ─────────────────────────────
export async function fetchEcoViolations(options?: {
  area?: string;
  startDate?: string;
  endDate?: string;
}): Promise<EcoViolation[]> {
  let allData: EcoViolation[] = [];
  let from = 0;
  const pageSize = 1000;

  // Sedot semua baris data mentah ke frontend
  // Mengurangi load dengan filter langsung di Postgres (murni perbandingan String sehingga aman dari TimeZone Javascript)
  while (true) {
    let query = supabase
      .from('eco_driving_violations')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('id', { ascending: false }) // PENYELAMAT PAGINASI BIAR GAK ADA DATA YANG KE-SKIP
      .range(from, from + pageSize - 1);

    if (options?.area && options.area !== 'ALL') {
      query = query.eq('area', options.area);
    }
    if (options?.startDate) {
      query = query.gte('tanggal', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('tanggal', options.endDate);
    }

    const { data, error } = await query;
    if (error) {
      console.error('fetchEcoViolations error:', error);
      break;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
    }

    if (!data || data.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return allData.slice(0, 50000);
}

// ─── COMPUTE DRIVER RANKINGS ──────────────────────────────────────────────────
export function computeDriverRankings(violations: EcoViolation[]): DriverRanking[] {
  const map: Record<string, DriverRanking> = {};

  violations.forEach(v => {
    // Samakan persis dengan Looker Studio: pisahkan row jika 1 driver bawa 2 Plat berbeda!
    const key = `${v.pengemudi || 'Tanpa Nama'}||${v.plat_nomor || '-'}`;
    
    if (!map[key]) {
      map[key] = {
        driver: v.pengemudi || 'Tanpa Nama',
        plat: v.plat_nomor || '-',
        driver_id: v.driver_id,
        total: 0,
        akselerasi: 0,
        perlambatan: 0,
        tikungan: 0,
        kecepatan: 0,
      };
    }
    map[key].total += 1;
    const jenis = v.jenis_peringatan?.toLowerCase() || '';
    if (jenis.includes('akselerasi'))   map[key].akselerasi += 1;
    if (jenis.includes('perlambatan'))  map[key].perlambatan += 1;
    if (jenis.includes('tikungan'))     map[key].tikungan += 1;
    if (jenis.includes('kecepatan'))    map[key].kecepatan += 1;
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ─── COMPUTE VIOLATIONS BY DATE ───────────────────────────────────────────────
export function computeViolationsByDate(violations: EcoViolation[]): ViolationByDate[] {
  const map: Record<string, ViolationByDate> = {};

  violations.forEach(v => {
    const date = v.tanggal;
    if (!map[date]) {
      map[date] = { date, perlambatan: 0, akselerasi: 0, tikungan: 0, kecepatan: 0 };
    }
    const jenis = v.jenis_peringatan?.toLowerCase() || '';
    if (jenis.includes('akselerasi'))  map[date].akselerasi += 1;
    if (jenis.includes('perlambatan')) map[date].perlambatan += 1;
    if (jenis.includes('tikungan'))    map[date].tikungan += 1;
    if (jenis.includes('kecepatan'))   map[date].kecepatan += 1;
  });

  return Object.values(map)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14); // last 14 days
}

// ─── COMPUTE SUMMARY ──────────────────────────────────────────────────────────
export function computeEcoSummary(violations: EcoViolation[], rankings: DriverRanking[]): EcoSummary {
  const total = violations.length;
  const perlambatan = violations.filter(v => v.jenis_peringatan?.toLowerCase().includes('perlambatan')).length;
  const akselerasi  = violations.filter(v => v.jenis_peringatan?.toLowerCase().includes('akselerasi')).length;
  const tikungan    = violations.filter(v => v.jenis_peringatan?.toLowerCase().includes('tikungan')).length;
  const kecepatan   = violations.filter(v => v.jenis_peringatan?.toLowerCase().includes('kecepatan')).length;
  const topDriver   = rankings[0]?.driver || '-';
  const topDriverTotal = rankings[0]?.total || 0;

  return { total, akselerasi, perlambatan, tikungan, kecepatan, topDriver, topDriverTotal };
}

/**
 * ROUTE DISTANCE MAPPING
 * Format key: "ORIGIN → DESTINATION" (uppercase, spasi di-trim)
 * Value: jarak dalam kilometer (km)
 * 
 * Untuk menambahkan rute baru, tinggal tambahkan entry baru di ROUTE_DISTANCES.
 * Kalau rute tidak ditemukan, jarak default = 0 (bisa di-edit manual di UI).
 */

export const ROUTE_DISTANCES: Record<string, number> = {
  // === JBK ROUTES ===
  'KCY → DOMESTIK': 5.6,
  'EKY → EKY': 17.6,
  'NKRW → SCY': 58.1,
  'NKRW → NCBT': 27.9,
  'NKRW → IKT': 65.2,
  'NKRW → PTB': 90.8,
  'NKRW → IMY': 137.0,
  'BDG → SCY': 170.0,
  'NCBT → SCY': 39.7,
  'NKRW → TCKG': 44.1,
  'NKRW → SPR': 55.0,
  'NCBT → TCKG': 25.0,
  'IKT → NCBT': 42.7,
  'IKT → IMPORT_IKT': 42.7,
  'NCBT → IKT': 42.7,
  'KCY → EKY': 25.0,
  'NSTR → IKT': 10.0,
  'NKRW → BDG': 115.0,
  'PTB → NCBT': 140.0,
  'NCBT → IMPORT_IKT': 42.7,
  'NKRW → CRB': 155.0,
  'PTB → IMPORT_PTB': 140.0,
  'NKRW → EKY': 25.0,
  'IKT → IKT': 42.7, // Import case, treat as NCBT-IKT
  'NKRW → IMPORT_IKT': 42.7, // Import case, treat as NCBT-IKT
  'SCY → IKT': 10.0, // SCY is NSTR
  'IKT → TCKG': 18.0,
  'NSTR → NCBT': 41.0,
  'NKRW → DOMESTIK': 6.0,
  'IKT → SCY': 10.0, // SCY is NSTR

  // === TMMIN ROUTES ===
  'POOL → KCY': 3.0,
  'KCY → PTB': 92.0,
  'KCY → IKT': 81.6,
  'IKT → KMDI': 81.0,
  'KMDI → PTB': 87.0,
  'IKT → KMD YARD': 81.0,
  'DNX → KCY': 17.0,
  'IKT → KMD': 81.0,
  'KMD YARD → PTB': 87.0,

  // === NGORO ROUTES ===
  'NKRW → MJKT': 714.0,
  'NCBT → MJKT': 742.0,
  'NSTR → MJKT': 768.0,
  'NKRW → MKJT': 714.0,
  'NCBT → MKJT': 742.0,
  'NSTR → MKJT': 768.0,

  // === SUMATERA ROUTES ===
  'NKRW → PALEMBANG': 596.0,
  'NKRW → LAMPUNG': 342.0,
};

/**
 * Cari jarak berdasarkan origin dan destination.
 * Otomatis coba kedua arah (A→B dan B→A).
 * @returns jarak dalam km, atau 0 jika rute tidak ditemukan
 */
export function getRouteDistance(origin: string, destination: string, area?: string): number {
  const o = (origin || '').trim().toUpperCase();
  let d = (destination || '').trim().toUpperCase();
  
  // Fallback logic khusus jika tujuan kosong (blank) di database
  if (!d || d === '---' || d === '') {
    const a = (area || '').toUpperCase();
    if (a === 'NGORO') d = 'MJKT';
    // Catatan: Sumatera ada 2 tujuan (Lampung/Palembang), jadi tetap butuh input di sheet
    // atau logika tambahan jika sudah pasti salah satu.
  }

  if (!o || !d || o === '---' || d === '---') return 0;

  // Coba arah normal dulu
  const key1 = `${o} → ${d}`;
  if (ROUTE_DISTANCES[key1] !== undefined) return ROUTE_DISTANCES[key1];

  // Coba arah balik
  const key2 = `${d} → ${o}`;
  if (ROUTE_DISTANCES[key2] !== undefined) return ROUTE_DISTANCES[key2];

  return 0;
}

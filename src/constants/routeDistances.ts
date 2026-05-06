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

  // === TMMIN ROUTES ===
  'POOL → KCY': 3.0,
  'KCY → PTB': 92.0,
  'KCY → IKT': 81.6,

  // === NGORO ROUTES ===
  // Bos tambahin rute-rute NGORO di sini

  // === SUMATERA ROUTES ===
  // Bos tambahin rute-rute Sumatera di sini
};

/**
 * Cari jarak berdasarkan origin dan destination.
 * Otomatis coba kedua arah (A→B dan B→A).
 * @returns jarak dalam km, atau 0 jika rute tidak ditemukan
 */
export function getRouteDistance(origin: string, destination: string): number {
  const o = (origin || '').trim().toUpperCase();
  const d = (destination || '').trim().toUpperCase();
  
  if (!o || !d || o === '---' || d === '---') return 0;

  // Coba arah normal dulu
  const key1 = `${o} → ${d}`;
  if (ROUTE_DISTANCES[key1] !== undefined) return ROUTE_DISTANCES[key1];

  // Coba arah balik
  const key2 = `${d} → ${o}`;
  if (ROUTE_DISTANCES[key2] !== undefined) return ROUTE_DISTANCES[key2];

  return 0;
}

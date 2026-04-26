import { supabase } from '../lib/supabase';
import { Driver, Ritase, RitaseStep } from '../types';

function calculateDuration(start: string | null, end: string | null, area: string = 'JBK'): string {
  if (!start || !end || start === '--:--' || end === '--:--') return '--';
  try {
    const s = start.split(':').map(Number);
    const e = end.split(':').map(Number);
    let diff = (e[0] * 60 + e[1]) - (s[0] * 60 + s[1]);
    
    // Handle cross-midnight
    if (diff < 0) diff += 1440;
    
    // Handle Long Haul Cross-Day (>20h)
    if (area !== 'JBK' && diff < 900) {
      diff += 1440;
    }
    
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  } catch (e) { return '--'; }
}

function calculateSIMStatus(expiryDate: string | null): 'Valid' | 'Expired' | 'Warning' {
  if (!expiryDate) return 'Expired';
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays < 30) return 'Warning';
  return 'Valid';
}

export async function fetchActiveDrivers(selectedDate: string, area: string = 'JBK', shift?: string) {
  try {
    let query = supabase
      .from('trips')
      .select(`
        driver_id,
        no_polisi,
        shift,
        area,
        drivers!inner (
          id,
          name,
          avatar_url,
          no_polisi
        )
      `)
      .eq('tanggal', selectedDate)
      .eq('area', area);

    if (shift) {
      query = query.ilike('shift', `%${shift}%`);
    }

    const { data: trips, error } = await query;
    if (error) throw error;

    const uniqueDrivers = new Map<string, Driver>();
    trips.forEach((row: any) => {
      const driver = row.drivers;
      if (driver && !uniqueDrivers.has(driver.id)) {
        uniqueDrivers.set(driver.id, {
          id: driver.id,
          name: driver.name,
          status: 'online', 
          avatar: driver.avatar_url || null,
          noPolisi: row.no_polisi || driver.no_polisi || '--' // Gunakan NoPol dari TRIP hari itu
        });
      }
    });

    return Array.from(uniqueDrivers.values());
  } catch (error) {
    console.error('Error fetch drivers:', error);
    return [];
  }
}

export async function fetchAllDrivers() {
  const { data } = await supabase.from('drivers').select('*').order('name');
  return data?.map(d => ({
    id: d.id, 
    name: d.name, 
    status: 'offline', 
    avatar: d.avatar_url,
    noPolisi: d.no_polisi, 
    simExpiry: d.sim_expiry, 
    simPhotoUrl: d.sim_photo_url,
    simStatus: calculateSIMStatus(d.sim_expiry),
    nik: d.nik,
    alamat: d.alamat
  })) || [];
}

export async function fetchDashboardData(selectedDate: string, driverId: string, area: string = 'JBK') {
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        drivers!inner (*)
      `)
      .eq('tanggal', selectedDate)
      .eq('driver_id', driverId)
      .eq('area', area)
      .order('ritase_no', { ascending: true });

    if (error) throw error;

    const ritases: Ritase[] = (trips || []).map((row: any, idx: number) => {
      const isFinished = !!row.actual_unloading;
      const isActive = !!row.actual_outpool && !isFinished;

      return {
        id: row.id || idx + 1,
        ritaseNo: row.ritase_no, 
        route: `${row.pdc_muat || '---'} → ${row.pdc_bongkar || '---'}`, 
        status: (isFinished ? 'finished' : (isActive ? 'active' : 'locked')) as any,
        type: (isFinished ? 'completed' : (isActive ? 'active' : 'locked')) as any,
        duration: calculateDuration(row.actual_in_pdc, row.actual_unloading, row.area || area),
        timeline: [
          { label: 'OUTPOOL', actual: row.actual_outpool || '--:--', type: (row.actual_outpool ? 'completed' : 'pending') as any },
          { label: 'IN PDC', plan: row.plan_dccp || '--:--', actual: row.actual_in_pdc || '--:--', type: (row.actual_in_pdc ? 'completed' : (isActive ? 'active' : 'pending')) as any },
          { label: 'OUT PDC', actual: row.actual_out_pdc || '--:--', type: (row.actual_out_pdc ? 'completed' : (row.actual_in_pdc ? 'active' : 'pending')) as any },
          { label: 'UNLOADING', plan: row.plan_unloading || '--:--', actual: row.actual_unloading || '--:--', type: (row.actual_unloading ? 'completed' : (row.actual_out_pdc ? 'active' : 'pending')) as any }
        ]
      };
    });

    const driverData = trips?.[0]?.drivers || null;

    return {
      driverDetails: driverData ? {
        id: driverData.id,
        name: driverData.name,
        status: ritases.some(r => r.status === 'active') ? 'online' : 'offline',
        avatar: driverData.avatar_url,
        noPolisi: driverData.no_polisi || trips?.[0]?.no_polisi,
        simExpiry: driverData.sim_expiry,
        simPhotoUrl: driverData.sim_photo_url,
        simStatus: calculateSIMStatus(driverData.sim_expiry)
      } : null,
      ritases,
      readiness: trips?.[0] ? {
        physicalHealth: 'OK',
        bloodPressure: 'NORMAL',
        alcoholTest: '0.00% (CLEAR)', 
        lastVerification: trips[0].actual_outpool || '--:--'
      } : null
    };
  } catch (error) {
    console.error('Error dashboard:', error);
    return { ritases: [], readiness: null, driverDetails: null };
  }
}

import { supabase } from '../lib/supabase';

export interface CarbonFootprint {
  ritaseNo: string | number;
  route: string;
  distance: number; // in km
  co2Emissions: number; // in kg
  fuelConsumption: number; // in liters
  cost: number; // in IDR
}

export interface CarbonSummary {
  totalDistance: number;
  totalCO2: number;
  totalFuel: number;
  totalCost: number;
  averageEmissionsPerKm: number;
  footprints: CarbonFootprint[];
}

// Constants for calculation
const CO2_PER_KM = 0.1; // 100g CO2/km = 0.1 kg CO2/km (typical truck)
const FUEL_CONSUMPTION_PER_KM = 0.04; // 4 liters per 100km
const FUEL_COST_PER_LITER = 7500; // IDR per liter (approximate)

/**
 * Calculate carbon footprint from distance
 * @param distanceKm Distance in kilometers
 * @returns Carbon footprint details
 */
export function calculateCarbonFromDistance(distanceKm: number) {
  const co2Emissions = distanceKm * CO2_PER_KM;
  const fuelConsumption = distanceKm * FUEL_CONSUMPTION_PER_KM;
  const cost = fuelConsumption * FUEL_COST_PER_LITER;

  return {
    co2Emissions,
    fuelConsumption,
    cost
  };
}

/**
 * Fetch all ritases for a specific date and driver, then calculate carbon footprint
 */
export async function fetchCarbonFootprintForDriver(
  selectedDate: string,
  driverId: string,
  area: string = 'JBK'
): Promise<CarbonSummary | null> {
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('tanggal', selectedDate)
      .eq('driver_id', driverId)
      .eq('area', area)
      .order('ritase_no', { ascending: true });

    if (error) throw error;
    if (!trips || trips.length === 0) {
      return {
        totalDistance: 0,
        totalCO2: 0,
        totalFuel: 0,
        totalCost: 0,
        averageEmissionsPerKm: 0,
        footprints: []
      };
    }

    const footprints: CarbonFootprint[] = trips.map((trip: any, idx: number) => {
      // User provides distance in km
      const distance = trip.jarak || 0; // jarak field in km

      const { co2Emissions, fuelConsumption, cost } = calculateCarbonFromDistance(distance);

      return {
        ritaseNo: trip.ritase_no,
        route: `${trip.pdc_muat || '---'} → ${trip.pdc_bongkar || '---'}`,
        distance,
        co2Emissions,
        fuelConsumption,
        cost
      };
    });

    // Calculate totals
    const totalDistance = footprints.reduce((sum, f) => sum + f.distance, 0);
    const totalCO2 = footprints.reduce((sum, f) => sum + f.co2Emissions, 0);
    const totalFuel = footprints.reduce((sum, f) => sum + f.fuelConsumption, 0);
    const totalCost = footprints.reduce((sum, f) => sum + f.cost, 0);
    const averageEmissionsPerKm = totalDistance > 0 ? totalCO2 / totalDistance : 0;

    return {
      totalDistance,
      totalCO2,
      totalFuel,
      totalCost,
      averageEmissionsPerKm,
      footprints
    };
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    return null;
  }
}

/**
 * Fetch carbon data for all drivers on a specific date and area
 */
export async function fetchFleetCarbonData(date: string, area: string = 'JBK'): Promise<Map<string, CarbonSummary>> {
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('tanggal', date)
      .eq('area', area)
      .order('driver_id', { ascending: true })
      .order('ritase_no', { ascending: true });

    if (error) throw error;

    const driverMap = new Map<string, CarbonSummary>();

    if (trips && trips.length > 0) {
      trips.forEach((trip: any) => {
        const driverId = trip.driver_id;
        const distance = trip.jarak || 0;

        if (!driverMap.has(driverId)) {
          driverMap.set(driverId, {
            totalDistance: 0,
            totalCO2: 0,
            totalFuel: 0,
            totalCost: 0,
            averageEmissionsPerKm: 0,
            footprints: []
          });
        }

        const summary = driverMap.get(driverId)!;
        const { co2Emissions, fuelConsumption, cost } = calculateCarbonFromDistance(distance);

        summary.footprints.push({
          ritaseNo: trip.ritase_no,
          route: `${trip.pdc_muat || '---'} → ${trip.pdc_bongkar || '---'}`,
          distance,
          co2Emissions,
          fuelConsumption,
          cost
        });

        summary.totalDistance += distance;
        summary.totalCO2 += co2Emissions;
        summary.totalFuel += fuelConsumption;
        summary.totalCost += cost;
        summary.averageEmissionsPerKm = summary.totalDistance > 0 ? summary.totalCO2 / summary.totalDistance : 0;
      });
    }

    return driverMap;
  } catch (error) {
    console.error('Error fetching fleet carbon data:', error);
    return new Map();
  }
}

/**
 * Convert CO2 kg to trees equivalent (1 tree absorbs ~20kg CO2/year)
 */
export function treesEquivalent(co2Kg: number): number {
  return Math.round((co2Kg / 20) * 100) / 100;
}

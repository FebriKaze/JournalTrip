import { supabase } from '../lib/supabase';
import { TrainingMonthlyRecord } from '../types';

export const getTrainingByDriverId = async (driverId: string): Promise<TrainingMonthlyRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('driver_training_monthly')
      .select('*')
      .eq('driver_id', driverId);

    if (error) {
      console.error('Error fetching training data:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching training data:', err);
    return [];
  }
};


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase
    .from('trips')
    .select('pdc_muat, pdc_bongkar')
    .limit(100);

  if (error) {
    console.error(error);
    return;
  }

  const muat = new Set(data.map(d => d.pdc_muat));
  const bongkar = new Set(data.map(d => d.pdc_bongkar));

  console.log('PDC MUAT:', Array.from(muat));
  console.log('PDC BONGKAR:', Array.from(bongkar));
}

checkData();

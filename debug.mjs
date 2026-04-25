import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const fetchEnv = (key) => envFile.split('\n').find(l => l.startsWith(key))?.split('=')[1]?.replace(/['"]/g, '').trim();

const supabase = createClient(fetchEnv('VITE_SUPABASE_URL'), fetchEnv('VITE_SUPABASE_ANON_KEY'));
async function run() {
  const { data } = await supabase.from('eco_driving_violations').select('*').limit(5);
  console.log("SAMPLE ROWS:");
  console.log(JSON.stringify(data, null, 2));
}
run();

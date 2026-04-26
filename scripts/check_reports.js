const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../../../../../../.env.local' }); // Need to load env vars

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzocqquxnrvifgzgjamq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '...'; // I will just use the project dir's env 
// Wait, I can run it from the project directory so it loads `.env.local`

const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('reports').select('*');
  if (error) console.error(error);
  console.log("Total reports:", data?.length);
  console.log("Categories found:", [...new Set(data?.map(r => r.category))]);
  console.log("Statuses found:", [...new Set(data?.map(r => r.status))]);
  console.log("Reports missing lat/lng:", data?.filter(r => !r.location_lat || !r.location_lng).length);
  console.log(data);
}
check();

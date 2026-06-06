import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  const tables = ['hotels', 'halls', 'venue_photos', 'venue_shortlists'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`Error querying ${table}:`, error.message);
    } else {
      console.log(`${table}: ${count}`);
    }
  }
}

checkCounts();

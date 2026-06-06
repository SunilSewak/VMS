import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverCols() {
  const tables = ['hotels', 'halls', 'venue_photos', 'venue_shortlists'];
  
  for (const t of tables) {
    const { error } = await supabase.from(t).insert([{}]);
    console.log(`Table ${t} error:`, error?.message || error?.details || error);
  }
}

discoverCols();

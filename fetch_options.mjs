import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

async function fetchOptions() {
  const tables = ['hotels', 'halls', 'venue_photos', 'venue_shortlists'];
  for (const table of tables) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const text = await res.text();
    console.log(`--- ${table} OPTIONS ---`);
    console.log(text.substring(0, 500) + '...');
  }
}

fetchOptions();

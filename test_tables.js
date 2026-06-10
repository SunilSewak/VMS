import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  const tables = ['quotations', 'negotiation_history', 'approved_commercials'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table ${table} query failed/does not exist: ${error.message}`);
      } else {
        console.log(`Table ${table} exists, rows:`, data);
      }
    } catch (e) {
      console.log(`Table ${table} error:`, e.message);
    }
  }
}

testTables();

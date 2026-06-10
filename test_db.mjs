import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Querying divisions...");
  const { data: divs, error: divErr } = await supabase.from('divisions').select('*');
  console.log("Divisions:", divs, "Error:", divErr);

  console.log("Querying cities...");
  const { data: cities, error: cityErr } = await supabase.from('cities').select('*');
  console.log("Cities:", cities, "Error:", cityErr);

  console.log("Querying meeting_types...");
  const { data: types, error: typeErr } = await supabase.from('meeting_types').select('*');
  console.log("Meeting Types:", types, "Error:", typeErr);

  console.log("Querying meeting_requests schema details...");
  const { data: requests, error: reqErr } = await supabase.from('meeting_requests').select('*').limit(1);
  console.log("Meeting Requests (1):", requests, "Error:", reqErr);
}

test();

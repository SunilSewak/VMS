import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Signing in as Sales Head...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'saleshead@ajantapharma.com',
    password: 'Test@123'
  });

  if (authErr) {
    console.error("Auth error:", authErr.message);
    return;
  }
  console.log("Authenticated successfully as", authData.user?.email);

  const { data: divs } = await supabase.from('divisions').select('id').limit(1);
  const { data: cities } = await supabase.from('cities').select('id').limit(1);

  console.log("Division ID:", divs?.[0]?.id);
  console.log("City ID:", cities?.[0]?.id);

  if (!divs?.[0]?.id || !cities?.[0]?.id) {
    console.error("Missing division or city.");
    return;
  }

  // Let's check meeting_requests check constraint using different statuses
  const statuses = [
    'DRAFT',
    'SHORTLISTED', // old shortlisted
    'VENUES_SHORTLISTED', // new shortlisted?
    'SUBMITTED_TO_ADMIN', // new submitted?
    'INVALID_STATUS_FOR_TEST'
  ];

  for (const status of statuses) {
    const payload = {
      request_number: 'TEST-REQ-' + Math.floor(1000 + Math.random() * 9000),
      meeting_name: 'Test Status ' + status,
      division_id: divs[0].id,
      city_id: cities[0].id,
      zone: 'West',
      start_date: '2026-06-12',
      end_date: '2026-06-13',
      expected_pax: 50,
      guaranteed_pax: 40,
      status: status
    };

    console.log(`\nTrying insert with status: ${status}...`);
    const { data, error } = await supabase.from('meeting_requests').insert([payload]).select('*');
    if (error) {
      console.log(`Failed for status ${status}:`, error.message);
    } else {
      console.log(`Success for status ${status}:`, data[0]?.id, data[0]?.status);
      // Clean it up
      await supabase.from('meeting_requests').delete().eq('id', data[0]?.id);
    }
  }
}

test();

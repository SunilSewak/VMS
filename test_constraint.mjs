import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: divs } = await supabase.from('divisions').select('id').limit(1);
  const { data: cities } = await supabase.from('cities').select('id').limit(1);
  
  // We don't have meeting types, but maybe meeting_type_id can be null or we can try inserting one.
  // Wait, let's see if we can get a valid meeting_type_id from the database or if meeting_types is really empty.
  // If it is empty, we might get a foreign key violation. Let's see.
  
  console.log("Division:", divs?.[0]?.id);
  console.log("City:", cities?.[0]?.id);

  // Test 1: Insert status 'INVALID_STATUS'
  const payload1 = {
    request_number: 'TEST-REQ-1',
    meeting_name: 'Test Constraint 1',
    division_id: divs?.[0]?.id,
    city_id: cities?.[0]?.id,
    zone: 'West',
    start_date: '2026-06-12',
    end_date: '2026-06-13',
    expected_pax: 50,
    guaranteed_pax: 40,
    status: 'INVALID_STATUS'
  };

  const { data: d1, error: e1 } = await supabase.from('meeting_requests').insert([payload1]);
  console.log("Invalid status insert result:", { d1, error: e1?.message || e1 });

  // Test 2: Insert status 'VENUES_SHORTLISTED'
  const payload2 = { ...payload1, request_number: 'TEST-REQ-2', status: 'VENUES_SHORTLISTED' };
  const { data: d2, error: e2 } = await supabase.from('meeting_requests').insert([payload2]);
  console.log("VENUES_SHORTLISTED insert result:", { d2, error: e2?.message || e2 });

  // Test 3: Insert status 'SUBMITTED_TO_ADMIN'
  const payload3 = { ...payload1, request_number: 'TEST-REQ-3', status: 'SUBMITTED_TO_ADMIN' };
  const { data: d3, error: e3 } = await supabase.from('meeting_requests').insert([payload3]);
  console.log("SUBMITTED_TO_ADMIN insert result:", { d3, error: e3?.message || e3 });

  // Test 4: Insert status 'AVAILABILITY_CHECK'
  const payload4 = { ...payload1, request_number: 'TEST-REQ-4', status: 'AVAILABILITY_CHECK' };
  const { data: d4, error: e4 } = await supabase.from('meeting_requests').insert([payload4]);
  console.log("AVAILABILITY_CHECK insert result:", { d4, error: e4?.message || e4 });
}

test();

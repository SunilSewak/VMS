import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf-8');
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
}

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testStatus() {
  console.log("Inserting meeting request with custom status...");
  // Let's get a division, city, and meeting type to test with
  const { data: divs } = await supabase.from('divisions').select('id').limit(1);
  const { data: cities } = await supabase.from('cities').select('id').limit(1);
  const { data: types } = await supabase.from('meeting_types').select('id').limit(1);
  
  if (!divs?.length || !cities?.length || !types?.length) {
    console.error("Missing division, city, or meeting type.");
    return;
  }
  
  const payload = {
    request_number: 'TEST-REQ-' + Math.floor(1000 + Math.random() * 9000),
    meeting_name: 'Test Status Check',
    division_id: divs[0].id,
    meeting_type_id: types[0].id,
    city_id: cities[0].id,
    zone: 'West',
    start_date: '2026-06-12',
    end_date: '2026-06-13',
    expected_pax: 50,
    guaranteed_pax: 40,
    residential_flag: false,
    rooms_required: 0,
    halls_required: 1,
    seating_style: 'Cluster',
    av_requirements: '',
    food_requirements: '',
    transfer_requirements: '',
    status: 'VENUES_SHORTLISTED'
  };
  
  // We try insertion as anonymous to see if we get check constraint error or RLS error
  // If we get check constraint error, it means the check constraint is checked first.
  const { data, error } = await supabase.from('meeting_requests').insert([payload]);
  console.log("Result:", { data, error });
}

testStatus();

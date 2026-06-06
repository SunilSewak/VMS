import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('cities').insert([
    { city_name: 'Mumbai' }
  ]).select();

  if (error) {
    console.error('Insert Error:', error.message);
  } else {
    console.log('Inserted City:', data);
  }
}

testInsert();

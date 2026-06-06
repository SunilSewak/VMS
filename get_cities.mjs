import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCities() {
  const { data, error } = await supabase.from('cities').select('*');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

getCities();

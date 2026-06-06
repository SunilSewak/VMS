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
if (!url || !key) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}
const supabase = createClient(url, key);
const { data, error, count } = await supabase.from('hotels').select('id, hotel_name, address, cities(city_name), hotel_categories(category_name), status', { count: 'exact' }).limit(5);
console.log(JSON.stringify({ data, error, count }, null, 2));

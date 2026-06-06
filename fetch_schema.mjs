import fs from 'fs';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

async function fetchSchema() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
    const text = await res.text();
    fs.writeFileSync('schema_dump.json', text);
    console.log("Schema dumped to schema_dump.json");
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

fetchSchema();

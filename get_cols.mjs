import fs from 'fs';

const supabaseUrl = 'https://cqfctzjypanrwzrbvfjq.supabase.co';
const supabaseKey = 'sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3';

async function fetchSchema() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const data = await res.json();
  
  console.log("Hotels:", Object.keys(data.definitions.hotels.properties).join(', '));
  console.log("Halls:", Object.keys(data.definitions.halls.properties).join(', '));
  console.log("Venue Photos:", Object.keys(data.definitions.venue_photos.properties).join(', '));
  console.log("Venue Shortlists:", Object.keys(data.definitions.venue_shortlists.properties).join(', '));
}

fetchSchema();

const url = "https://cqfctzjypanrwzrbvfjq.supabase.co/rest/v1";
const key = "sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3";

const cities = [
  "18fd3bd4-5e44-44c8-a6c6-50c8c5fc3ecb", // Mumbai
  "2b8f5d7a-1fc1-47d5-8a71-a3692d8d486d", // Delhi
  "47e951c2-0206-4db8-9dab-9245aa5cd0cd", // Bangalore
  "aef4670b-ec88-4897-8e4c-bd9202ca8cce"  // Hyderabad
];

const divisions = [
  "cd3bc1e1-730d-43f5-98fb-19740b24a15a", // Anvaxx
  "8859a901-7888-4e43-aab0-1b6b22c1da7e", // Nuventa
  "0dfc6c33-f494-4c17-a926-32bb769763f4"  // Solesta
];

const eventCodes = ["EVT-PLN001", "EVT-VEN002", "EVT-RM003", "EVT-INV004", "EVT-CLS005"];

async function updateEvents() {
    for (let i = 0; i < eventCodes.length; i++) {
        const code = eventCodes[i];
        const cityId = cities[i % cities.length];
        const divId = divisions[i % divisions.length];
        
        const res = await fetch(`${url}/events?event_code=eq.${code}`, {
            method: 'PATCH',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                city_id: cityId,
                division_id: divId
            })
        });
        
        if (!res.ok) {
            const text = await res.text();
            console.error(`Failed to update ${code}: ${text}`);
        } else {
            console.log(`Successfully updated ${code}`);
        }
    }
}

updateEvents().catch(console.error);

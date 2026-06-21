const url = "https://cqfctzjypanrwzrbvfjq.supabase.co/rest/v1/events";
const key = "sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3";

const events = [
    { event_code: "EVT-RM003", event_name: "Exec Retreat Rooming In Progress", expected_pax: 25, lifecycle_status: "ROOMING_FINALIZED", start_date: "2026-07-20", end_date: "2026-07-22" },
    { event_code: "EVT-INV004", event_name: "Product Launch Invoice Submitted", expected_pax: 300, lifecycle_status: "INVOICE_AUDIT", start_date: "2026-05-15", end_date: "2026-05-16" }
];

async function seed() {
    for (const evt of events) {
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(evt)
        });
        
        if (!res.ok) {
            console.error(`Failed with ${evt.lifecycle_status}`);
            // Fallback
            evt.lifecycle_status = evt.event_code === "EVT-RM003" ? "BOOKED" : "EXECUTED";
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(evt)
            });
            if (!res.ok) {
                const err = await res.text();
                console.error(`Fallback failed for ${evt.event_code}: ${res.status} ${err}`);
            } else {
                console.log(`Successfully inserted ${evt.event_code} with fallback ${evt.lifecycle_status}`);
            }
        } else {
            console.log(`Successfully inserted ${evt.event_code} with ${evt.lifecycle_status}`);
        }
    }
}

seed().catch(console.error);

// api/record-price.js
export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { game_id, nsuid, usd_price, brl_price } = request.body;
  if (!game_id) {
    return response.status(400).json({ error: 'Missing game_id' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({ error: 'Supabase credentials not configured on Vercel' });
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const res = await fetch(`${supabaseUrl}/rest/v1/price_history`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        game_id: game_id,
        nsuid: nsuid ? nsuid.toString() : null,
        usd_price: usd_price !== undefined && usd_price !== null ? parseFloat(usd_price) : null,
        brl_price: brl_price !== undefined && brl_price !== null ? parseFloat(brl_price) : null,
        date: todayStr
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return response.status(res.status).json({ error: `Supabase responded with status ${res.status}: ${errText}` });
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording price history in Supabase:', error);
    return response.status(500).json({ error: error.message });
  }
}

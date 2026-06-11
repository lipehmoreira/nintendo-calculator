// api/history.js
export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { game_id } = request.query;
  if (!game_id) {
    return response.status(400).json({ error: 'Missing game_id parameter' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({ error: 'Supabase credentials not configured on Vercel' });
  }

  try {
    const targetUrl = `${supabaseUrl}/rest/v1/price_history?game_id=eq.${encodeURIComponent(game_id)}&order=date.asc`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return response.status(res.status).json({ error: `Supabase responded with status ${res.status}: ${errText}` });
    }

    const data = await res.json();
    return response.status(200).json({ history: data });
  } catch (error) {
    console.error('Error fetching price history from Supabase:', error);
    return response.status(500).json({ error: error.message });
  }
}

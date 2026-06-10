// api/price.js
export default async function handler(request, response) {
  // Configuração de headers CORS para permitir requisições de outros domínios ou do ambiente local
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar requisição OPTIONS prévia do CORS
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const { ids } = request.query;
  if (!ids) {
    return response.status(400).json({ error: 'Missing ids parameter' });
  }

  try {
    // URL oficial da API da Nintendo eShop brasileira
    const nintendoUrl = `https://api.ec.nintendo.com/v1/price?country=BR&lang=pt&ids=${ids}`;
    
    const res = await fetch(nintendoUrl);
    
    if (!res.ok) {
      return response.status(res.status).json({ error: `Nintendo API responded with status ${res.status}` });
    }

    const data = await res.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Nintendo prices:', error);
    return response.status(500).json({ error: error.message });
  }
}

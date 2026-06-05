const ADMIN_USER = 'jackm';
const ADMIN_PASS = 'adminmiles';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // GET /api/stats — public endpoint
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      const stats = await env.STATS.get('live-stats', 'json');
      return jsonResponse(stats || {
        capitalUnderManagement: null,
        pnlMonth: null,
        pnlYTD: null,
        lastUpdated: null
      });
    }

    // POST /api/admin/save — protected endpoint
    if (url.pathname === '/api/admin/save' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }

      if (body.username !== ADMIN_USER || body.password !== ADMIN_PASS) {
        return jsonResponse({ error: 'Invalid credentials' }, 401);
      }

      const stats = {
        capitalUnderManagement: body.capitalUnderManagement ?? null,
        pnlMonth: body.pnlMonth ?? null,
        pnlYTD: body.pnlYTD ?? null,
        lastUpdated: new Date().toISOString()
      };

      await env.STATS.put('live-stats', JSON.stringify(stats));
      return jsonResponse({ success: true });
    }

    // Serve all other requests as static assets
    return env.ASSETS.fetch(request);
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare('SELECT * FROM domains ORDER BY created_at DESC').all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    try {
        const { domain, domain_url, registrar, registrar_url, expiry_date, notes, status } = await request.json() as any;

        if (!domain) {
            return new Response(JSON.stringify({ error: 'Domain is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const result = await env.DB.prepare(
            'INSERT INTO domains (domain, domain_url, registrar, registrar_url, expiry_date, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(domain, domain_url || null, registrar || null, registrar_url || null, expiry_date || null, notes || null, status || 'Active', new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true, result }), { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

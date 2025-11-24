interface Env {
    DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const { domain, domain_url, registrar, registrar_url, expiry_date, notes, status } = await request.json() as any;

        await env.DB.prepare(
            'UPDATE domains SET domain = ?, domain_url = ?, registrar = ?, registrar_url = ?, expiry_date = ?, notes = ?, status = ? WHERE id = ?'
        ).bind(domain, domain_url || null, registrar || null, registrar_url || null, expiry_date || null, notes || null, status, id).run();

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { env, params } = context;
    const id = params.id;

    try {
        await env.DB.prepare('DELETE FROM domains WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

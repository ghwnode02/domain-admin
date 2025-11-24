interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { id } = await request.json() as any;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Domain ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const domainRecord = await env.DB.prepare('SELECT * FROM domains WHERE id = ?').bind(id).first();

        if (!domainRecord) {
            return new Response(JSON.stringify({ error: 'Domain not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const domain = domainRecord.domain as string;
        let status = 'Unknown';

        try {
            // Simple check: fetch the domain
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`https://${domain}`, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                status = 'Active';
            } else {
                status = `Error: ${res.status}`;
            }
        } catch (e) {
            status = 'Down';
        }

        await env.DB.prepare('UPDATE domains SET status = ?, last_checked = ? WHERE id = ?')
            .bind(status, new Date().toISOString(), id)
            .run();

        return new Response(JSON.stringify({ success: true, status }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

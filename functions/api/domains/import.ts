interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { domains } = await request.json() as any;

        if (!Array.isArray(domains) || domains.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Get existing domains to check for duplicates
        const existingDomainsResult = await env.DB.prepare('SELECT domain FROM domains').all();
        const existingDomains = new Set(existingDomainsResult.results.map((d: any) => d.domain.toLowerCase()));

        // Filter out duplicates (case-insensitive comparison)
        const newDomains = domains.filter(d => !existingDomains.has(d.domain.toLowerCase()));
        const skippedCount = domains.length - newDomains.length;

        if (newDomains.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                imported: 0, 
                skipped: skippedCount,
                message: 'All domains already exist'
            }), { headers: { 'Content-Type': 'application/json' } });
        }

        // Insert only new domains
        const stmt = env.DB.prepare(
            'INSERT INTO domains (domain, domain_url, registrar, registrar_url, expiry_date, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        const batch = newDomains.map(d => stmt.bind(
            d.domain,
            d.domain_url || null,
            d.registrar || null,
            d.registrar_url || null,
            d.expiry_date || null,
            d.notes || null,
            'Active',
            new Date().toISOString()
        ));

        await env.DB.batch(batch);

        return new Response(JSON.stringify({ 
            success: true, 
            imported: newDomains.length,
            skipped: skippedCount
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

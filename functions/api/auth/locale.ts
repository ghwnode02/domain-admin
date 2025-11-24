import { jwtVerify } from 'jose';

interface Env {
    DB: D1Database;
    JWT_SECRET?: string;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const cookieHeader = request.headers.get('Cookie');

    if (!cookieHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
    const token = cookies['auth_token'];

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const secretStr = env.JWT_SECRET || 'my-secret-key-change-in-production';
        const secret = new TextEncoder().encode(secretStr);
        const { payload } = await jwtVerify(token, secret);

        const body = await request.json() as { locale: string };
        
        if (!body.locale || !['zh-CN', 'en-US'].includes(body.locale)) {
            return new Response(JSON.stringify({ error: 'Invalid locale' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        await env.DB.prepare('UPDATE users SET locale = ? WHERE id = ?')
            .bind(body.locale, payload.id)
            .run();

        return new Response(JSON.stringify({ success: true, locale: body.locale }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
};

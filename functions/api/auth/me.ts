import { jwtVerify } from 'jose';

interface Env {
    DB: D1Database;
    JWT_SECRET?: string;
    ADMIN_USER?: string;
    ADMIN_PASSWORD?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const cookieHeader = request.headers.get('Cookie');

    if (!cookieHeader) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
    const token = cookies['auth_token'];

    if (!token) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const secretStr = env.JWT_SECRET || 'my-secret-key-change-in-production';
        const secret = new TextEncoder().encode(secretStr);
        const { payload } = await jwtVerify(token, secret);

        if (payload.id === 1 && env.ADMIN_USER) {
            return new Response(JSON.stringify({ 
                authenticated: true, 
                user: {
                    id: 1,
                    username: env.ADMIN_USER,
                    locale: 'zh-CN'
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userResult = await env.DB.prepare('SELECT id, username, locale FROM users WHERE id = ?')
            .bind(payload.id)
            .first();

        if (!userResult) {
            return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ 
            authenticated: true, 
            user: {
                id: userResult.id,
                username: userResult.username,
                locale: userResult.locale || 'zh-CN'
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
};

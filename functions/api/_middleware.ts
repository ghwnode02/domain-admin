import { jwtVerify } from 'jose';

interface Env {
    JWT_SECRET?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Skip auth for login/logout and cron tasks
    if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/api/cron/')) {
        return next();
    }

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
        await jwtVerify(token, secret);
        return next();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
};

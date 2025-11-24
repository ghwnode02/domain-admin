import { SignJWT } from 'jose';

interface Env {
    DB: D1Database;
    ADMIN_USER?: string;
    ADMIN_PASSWORD?: string;
    JWT_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { username, password } = await request.json() as any;

        if (!username || !password) {
            return new Response('Missing username or password', { status: 400 });
        }

        let user = null;

        // 1. Check Environment Variables (Priority)
        if (env.ADMIN_USER && env.ADMIN_PASSWORD) {
            if (username === env.ADMIN_USER && password === env.ADMIN_PASSWORD) {
                user = {
                    id: 1, // Mock ID for env var user
                    username: env.ADMIN_USER
                };
            }
        }

        // 2. Fallback to Database if not authenticated via Env Vars
        if (!user) {
            // Hash the password (SHA-256)
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Query user
            user = await env.DB.prepare('SELECT id, username, locale FROM users WHERE username = ? AND password_hash = ?')
                .bind(username, passwordHash)
                .first();
        }

        if (!user) {
            return new Response('Invalid credentials', { status: 401 });
        }

        // Generate JWT
        const secretStr = env.JWT_SECRET || 'my-secret-key-change-in-production';
        const secret = new TextEncoder().encode(secretStr);
        const token = await new SignJWT({ sub: user.id.toString(), username: user.username, id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        // Set Cookie
        const headers = new Headers();
        headers.append('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`);

        return new Response(JSON.stringify({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username,
                locale: user.locale || 'zh-CN'
            } 
        }), {
            headers: {
                ...Object.fromEntries(headers),
                'Content-Type': 'application/json'
            }
        });

    } catch (e) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
};

interface Env {
    DB: D1Database;
}

interface NotificationSettings {
    id?: number;
    telegram_enabled: boolean;
    telegram_bot_token: string;
    telegram_chat_id: string;
    feishu_enabled: boolean;
    feishu_webhook_url: string;
    notify_days_before: number;
    updated_at?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;

    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM notification_settings ORDER BY id DESC LIMIT 1'
        ).all();

        if (!results || results.length === 0) {
            const defaultSettings = {
                telegram_enabled: false,
                telegram_bot_token: '',
                telegram_chat_id: '',
                feishu_enabled: false,
                feishu_webhook_url: '',
                notify_days_before: 30
            };
            return new Response(JSON.stringify(defaultSettings), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const settings = results[0] as any;
        const response: NotificationSettings = {
            id: settings.id,
            telegram_enabled: Boolean(settings.telegram_enabled),
            telegram_bot_token: settings.telegram_bot_token || '',
            telegram_chat_id: settings.telegram_chat_id || '',
            feishu_enabled: Boolean(settings.feishu_enabled),
            feishu_webhook_url: settings.feishu_webhook_url || '',
            notify_days_before: settings.notify_days_before || 30,
            updated_at: settings.updated_at
        };

        return new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    try {
        const settings = await request.json() as NotificationSettings;

        const { results } = await env.DB.prepare(
            'SELECT id FROM notification_settings ORDER BY id DESC LIMIT 1'
        ).all();

        if (!results || results.length === 0) {
            await env.DB.prepare(
                `INSERT INTO notification_settings (
                    telegram_enabled, telegram_bot_token, telegram_chat_id,
                    feishu_enabled, feishu_webhook_url, notify_days_before,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
            ).bind(
                settings.telegram_enabled ? 1 : 0,
                settings.telegram_bot_token || '',
                settings.telegram_chat_id || '',
                settings.feishu_enabled ? 1 : 0,
                settings.feishu_webhook_url || '',
                settings.notify_days_before || 30
            ).run();
        } else {
            const settingsId = (results[0] as any).id;
            await env.DB.prepare(
                `UPDATE notification_settings SET
                    telegram_enabled = ?,
                    telegram_bot_token = ?,
                    telegram_chat_id = ?,
                    feishu_enabled = ?,
                    feishu_webhook_url = ?,
                    notify_days_before = ?,
                    updated_at = datetime('now')
                WHERE id = ?`
            ).bind(
                settings.telegram_enabled ? 1 : 0,
                settings.telegram_bot_token || '',
                settings.telegram_chat_id || '',
                settings.feishu_enabled ? 1 : 0,
                settings.feishu_webhook_url || '',
                settings.notify_days_before || 30,
                settingsId
            ).run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

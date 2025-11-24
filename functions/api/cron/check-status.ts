interface Env {
    DB: D1Database;
}

async function sendTelegramNotification(botToken: string, chatId: string, message: string): Promise<boolean> {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return response.ok;
    } catch (e) {
        console.error('Telegram notification failed:', e);
        return false;
    }
}

async function sendFeishuNotification(webhookUrl: string, message: string): Promise<boolean> {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                msg_type: 'text',
                content: { text: message }
            })
        });
        if (response.ok) {
            const result = await response.json() as any;
            return result.code === 0;
        }
        return false;
    } catch (e) {
        console.error('Feishu notification failed:', e);
        return false;
    }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;

    try {
        // Get notification settings
        const settingsResult = await env.DB.prepare(
            'SELECT * FROM notification_settings ORDER BY id DESC LIMIT 1'
        ).all();

        let telegramEnabled = false;
        let telegramBotToken = '';
        let telegramChatId = '';
        let feishuEnabled = false;
        let feishuWebhookUrl = '';

        if (settingsResult.results && settingsResult.results.length > 0) {
            const settings = settingsResult.results[0] as any;
            telegramEnabled = Boolean(settings.telegram_enabled);
            feishuEnabled = Boolean(settings.feishu_enabled);

            if (telegramEnabled && settings.telegram_bot_token && settings.telegram_chat_id) {
                telegramBotToken = settings.telegram_bot_token;
                telegramChatId = settings.telegram_chat_id;
            } else {
                telegramEnabled = false;
            }

            if (feishuEnabled && settings.feishu_webhook_url) {
                feishuWebhookUrl = settings.feishu_webhook_url;
            } else {
                feishuEnabled = false;
            }
        }

        // Get domains to check:
        // 1. All domains marked as 'Active' (to detect when they go offline)
        // 2. Domains not checked in the last hour
        // 3. Domains never checked
        const { results } = await env.DB.prepare(
            `SELECT * FROM domains 
             WHERE status = 'Active' 
             OR last_checked IS NULL 
             OR last_checked < datetime('now', '-1 hour')`
        ).all();

        const updates = [];
        const offlineDomains = [];

        // Ensure results is defined
        if (!results || results.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                checked: 0,
                offline_count: 0,
                offline_domains: [],
                sent_to: []
            }), { headers: { 'Content-Type': 'application/json' } });
        }

        for (const domain of results) {
            const d = domain as any;
            const oldStatus = d.status;
            let newStatus = 'Unknown';

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const res = await fetch(`https://${d.domain}`, { method: 'HEAD', signal: controller.signal });
                clearTimeout(timeoutId);

                // Treat any non-2xx status as offline
                if (res.ok) {
                    newStatus = 'Active';
                } else {
                    newStatus = 'Down';  // Changed: treat HTTP errors as Down
                }
            } catch (e) {
                newStatus = 'Down';
            }

            updates.push(
                env.DB.prepare('UPDATE domains SET status = ?, last_checked = ? WHERE id = ?')
                    .bind(newStatus, new Date().toISOString(), d.id)
            );

            // Detect domain going offline
            // Notify if status changed from Active to Down
            if (oldStatus === 'Active' && newStatus === 'Down') {
                offlineDomains.push(d.domain);
            }
        }

        if (updates.length > 0) {
            await env.DB.batch(updates);
        }

        // Send offline notifications
        const sentTo = [];
        if (offlineDomains.length > 0 && (telegramEnabled || feishuEnabled)) {
            const message = `🔔 域名离线提醒 / Domain Offline Alert\n\n` +
                `以下域名检测到离线：\nThe following domains are offline:\n\n` +
                offlineDomains.map(d => `• ${d}`).join('\n') +
                `\n\n⚠️ 请检查网站服务状态！\nPlease check the website service status!`;

            if (telegramEnabled && telegramBotToken && telegramChatId) {
                const sent = await sendTelegramNotification(telegramBotToken, telegramChatId, message);
                if (sent) sentTo.push('Telegram');
            }

            if (feishuEnabled && feishuWebhookUrl) {
                const sent = await sendFeishuNotification(feishuWebhookUrl, message);
                if (sent) sentTo.push('Feishu');
            }
        }

        return new Response(JSON.stringify({
            success: true,
            checked: updates.length,
            offline_count: offlineDomains.length,
            offline_domains: offlineDomains,
            sent_to: sentTo
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

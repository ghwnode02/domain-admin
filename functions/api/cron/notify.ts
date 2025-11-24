interface Env {
    DB: D1Database;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string;
    FEISHU_WEBHOOK_URL?: string;
    NOTIFY_DAYS_BEFORE?: string;
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
            const result = await response.json();
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
        const settingsResult = await env.DB.prepare(
            'SELECT * FROM notification_settings ORDER BY id DESC LIMIT 1'
        ).all();

        let notifyDays = env.NOTIFY_DAYS_BEFORE ? parseInt(env.NOTIFY_DAYS_BEFORE) : 30;
        let telegramBotToken = env.TELEGRAM_BOT_TOKEN || '';
        let telegramChatId = env.TELEGRAM_CHAT_ID || '';
        let feishuWebhookUrl = env.FEISHU_WEBHOOK_URL || '';
        let telegramEnabled = false;
        let feishuEnabled = false;

        if (settingsResult.results && settingsResult.results.length > 0) {
            const settings = settingsResult.results[0] as any;
            notifyDays = settings.notify_days_before || notifyDays;
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
        } else {
            telegramEnabled = !!(telegramBotToken && telegramChatId);
            feishuEnabled = !!feishuWebhookUrl;
        }
        
        const { results } = await env.DB.prepare(
            `SELECT * FROM domains WHERE expiry_date < datetime('now', '+${notifyDays} days') AND expiry_date > datetime('now')`
        ).all();

        if (!results || results.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'No domains expiring soon' }), { 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const notifications = [];
        let message = '🔔 域名到期提醒 / Domain Expiry Alert\n\n';
        message += `以下域名将在 ${notifyDays} 天内到期：\nThe following domains will expire within ${notifyDays} days:\n\n`;

        for (const domain of results) {
            const d = domain as any;
            const expiryDate = new Date(d.expiry_date);
            const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            message += `• ${d.domain} - ${daysLeft} 天 / days (${d.expiry_date})\n`;
            notifications.push(d.domain);
        }

        const sentTo = [];

        if (telegramEnabled && telegramBotToken && telegramChatId) {
            const sent = await sendTelegramNotification(telegramBotToken, telegramChatId, message);
            if (sent) sentTo.push('Telegram');
        }

        if (feishuEnabled && feishuWebhookUrl) {
            const sent = await sendFeishuNotification(feishuWebhookUrl, message);
            if (sent) sentTo.push('Feishu');
        }

        return new Response(JSON.stringify({ 
            success: true, 
            domains_count: notifications.length,
            domains: notifications,
            sent_to: sentTo
        }), { 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
};

interface NotificationSettings {
    telegramEnabled: boolean;
    telegramBotToken: string;
    telegramChatId: string;
    feishuEnabled: boolean;
    feishuWebhookUrl: string;
}

export const onRequestPost: PagesFunction = async (context) => {
    const { request } = context;

    try {
        const settings = await request.json() as NotificationSettings;
        const results = [];

        if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
            try {
                const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
                const telegramResponse = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: settings.telegramChatId,
                        text: '🔔 测试通知 / Test Notification\n\n这是来自域名管理系统的测试消息。\nThis is a test message from Domain Admin System.',
                        parse_mode: 'HTML'
                    })
                });

                if (telegramResponse.ok) {
                    results.push({ platform: 'Telegram', success: true });
                } else {
                    const error = await telegramResponse.json();
                    results.push({ platform: 'Telegram', success: false, error: error.description });
                }
            } catch (e) {
                results.push({ platform: 'Telegram', success: false, error: e.message });
            }
        }

        if (settings.feishuEnabled && settings.feishuWebhookUrl) {
            try {
                const feishuResponse = await fetch(settings.feishuWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        msg_type: 'text',
                        content: {
                            text: '🔔 测试通知 / Test Notification\n\n这是来自域名管理系统的测试消息。\nThis is a test message from Domain Admin System.'
                        }
                    })
                });

                if (feishuResponse.ok) {
                    const result = await feishuResponse.json();
                    if (result.code === 0) {
                        results.push({ platform: 'Feishu', success: true });
                    } else {
                        results.push({ platform: 'Feishu', success: false, error: result.msg });
                    }
                } else {
                    results.push({ platform: 'Feishu', success: false, error: 'HTTP error' });
                }
            } catch (e) {
                results.push({ platform: 'Feishu', success: false, error: e.message });
            }
        }

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: 'No notification platforms enabled' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const allSuccess = results.every(r => r.success);
        return new Response(JSON.stringify({ success: allSuccess, results }), {
            status: allSuccess ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

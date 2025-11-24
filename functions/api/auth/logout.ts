export const onRequestPost: PagesFunction = async () => {
    const headers = new Headers();
    headers.append('Set-Cookie', `auth_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`);

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            ...Object.fromEntries(headers),
            'Content-Type': 'application/json'
        }
    });
};

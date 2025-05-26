export function createFormData(obj: Record<string, string>) {
    return new URLSearchParams(obj);
}

export function createUrl(uri: string, params: Record<string, string> = {}) {
    const url = new URL(uri);

    if (Object.keys(params).length) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.append(key, value);
        }
    }

    return url.toString();
}

export function createBasicToken(clientId?: string, clientSecret?: string) {
    if (!clientId) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Environment: CLIENT_ID is not defined'
        });
    }

    if (!clientSecret) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Environment: CLIENT_SECRET is not defined'
        });
    }

    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

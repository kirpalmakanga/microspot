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

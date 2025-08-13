import axios from 'axios';

const APP_URL = window.location.origin;

const authInstance = axios.create({
    baseURL: `${APP_URL}/api`
});

export async function redirectToLogIn() {
    const {
        data: { url }
    } = await authInstance.get('/login');

    window.location.href = url;
}

export async function exchangeCodeForTokens(authorizationCode: string) {
    const { data } = await authInstance.get(`/token/${authorizationCode}`);

    return data as { accessToken: string; refreshToken: string };
}

export async function refreshAccessToken(refreshToken: string) {
    const {
        data: { accessToken }
    } = await authInstance.get(`/refresh/${refreshToken}`);

    return accessToken as string;
}

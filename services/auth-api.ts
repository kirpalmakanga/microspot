import axios from 'axios';

const APP_URL = window.location.origin;

export async function redirectToLogIn() {
    const {
        data: { url }
    } = await axios(`${APP_URL}/api/login`);

    window.location.href = url;
}

export async function exchangeCodeForTokens(authorizationCode: string) {
    const { data } = await axios(`${APP_URL}/api/token/${authorizationCode}`);

    return data as { accessToken: string; refreshToken: string };
}

export async function refreshAccessToken(refreshToken: string) {
    const {
        data: { accessToken }
    } = await axios(`${APP_URL}/api/refresh/${refreshToken}`);

    return accessToken as string;
}

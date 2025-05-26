import axios from 'axios';
import { AUTH_API_URL } from '~/server/config';
import { createBasicToken, createFormData } from '~/server/helpers';

const {
    env: { CLIENT_ID, CLIENT_SECRET, APP_REDIRECT_URL }
} = process;

export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code');

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid auth code.'
        });
    }

    if (!APP_REDIRECT_URL) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Environment: APP_REDIRECT_URL is not defined'
        });
    }

    const {
        data: { access_token: accessToken, refresh_token: refreshToken }
    } = await axios.post(
        AUTH_API_URL,
        createFormData({
            code,
            grant_type: 'authorization_code',
            redirect_uri: APP_REDIRECT_URL
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${createBasicToken(
                    CLIENT_ID,
                    CLIENT_SECRET
                )}`
            }
        }
    );

    return {
        accessToken,
        refreshToken
    };
});

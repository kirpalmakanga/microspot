import axios from 'axios';
import { AUTH_API_URL, BASIC_TOKEN, REDIRECT_URL } from '~/server/config';
import { createFormData } from '~/server/helpers';

export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code');

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        });
    }

    const {
        data: { access_token: accessToken, refresh_token: refreshToken }
    } = await axios.post(
        AUTH_API_URL,
        createFormData({
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URL
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${BASIC_TOKEN}`
            }
        }
    );

    return {
        accessToken,
        refreshToken
    };
});

import axios from 'axios';
import { AUTH_API_URL, BASIC_TOKEN } from '~/server/config';
import { createFormData } from '~/server/helpers';

export default defineEventHandler(async (event) => {
    const refreshToken = getRouterParam(event, 'refreshToken');

    if (!refreshToken) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        });
    }

    const {
        data: { access_token: accessToken }
    } = await axios.post(
        AUTH_API_URL,
        createFormData({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${BASIC_TOKEN}`
            }
        }
    );

    return {
        accessToken
    };
});

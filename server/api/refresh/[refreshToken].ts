import axios from 'axios';
import { AUTH_API_URL } from '~/server/config';
import { createBasicToken, createFormData } from '~/server/helpers';

const {
    env: { CLIENT_ID, CLIENT_SECRET }
} = process;

export default defineEventHandler(async (event) => {
    const refreshToken = getRouterParam(event, 'refreshToken');

    if (!refreshToken) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid refresh token'
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
                Authorization: `Basic ${createBasicToken(
                    CLIENT_ID,
                    CLIENT_SECRET
                )}`
            }
        }
    );

    return {
        accessToken
    };
});

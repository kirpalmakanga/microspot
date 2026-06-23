import axios from 'axios';
import { AUTH_API_URI } from '~/server/config';
import { createBasicToken, createFormData, getRedirectUri } from '~/server/helpers';

const { CLIENT_ID, CLIENT_SECRET } = process.env;

export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code');

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid auth code.'
        });
    }

    const {
        data: { access_token: accessToken, refresh_token: refreshToken }
    } = await axios.post(
        AUTH_API_URI,
        createFormData({
            code,
            grant_type: 'authorization_code',
            redirect_uri: getRedirectUri(event)
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${createBasicToken(CLIENT_ID, CLIENT_SECRET)}`
            }
        }
    );

    return {
        accessToken,
        refreshToken
    };
});

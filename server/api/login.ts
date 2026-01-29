import { randomUUID } from 'crypto';
import { SCOPES } from '~/server/config';
import { createUrl } from '~/server/helpers';

const {
    env: { CLIENT_ID, APP_REDIRECT_URL }
} = process;

export default defineEventHandler(() => {
    if (!CLIENT_ID) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Environment: CLIENT_ID is not defined'
        });
    }

    if (!APP_REDIRECT_URL) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Environment: APP_REDIRECT_URL is not defined'
        });
    }

    return {
        url: createUrl('https://accounts.spotify.com/authorize', {
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: SCOPES.join(' '),
            redirect_uri: APP_REDIRECT_URL,
            show_dialog: 'true',
            state: randomUUID()
        })
    };
});

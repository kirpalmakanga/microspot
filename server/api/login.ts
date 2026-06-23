import { randomUUID } from 'crypto';
import { SCOPES } from '~/server/config';
import { createUrl, getRedirectUri } from '~/server/helpers';

const { CLIENT_ID } = process.env;

export default defineEventHandler((event) => {
    if (!CLIENT_ID) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Environment: CLIENT_ID is not defined'
        });
    }

    return {
        url: createUrl('https://accounts.spotify.com/authorize', {
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: SCOPES.join(' '),
            redirect_uri: getRedirectUri(event),
            show_dialog: 'true',
            state: randomUUID()
        })
    };
});

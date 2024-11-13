import { randomUUID } from 'crypto';
import { CLIENT_ID, REDIRECT_URL, SCOPES } from '~/server/config';
import { createUrl } from '~/server/helpers';

export default defineEventHandler((event) => {
    return {
        url: createUrl('https://accounts.spotify.com/authorize', {
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: SCOPES.join(' '),
            redirect_uri: REDIRECT_URL,
            show_dialog: 'true',
            state: randomUUID()
        })
    };
});

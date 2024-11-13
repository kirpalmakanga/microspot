const {
    env: { CLIENT_ID, CLIENT_SECRET }
} = process;

export { CLIENT_ID, CLIENT_SECRET };

export const BASIC_TOKEN = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`
).toString('base64');
export const AUTH_API_URL = 'https://accounts.spotify.com/api/token';
export const APP_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://microspot.netlify.app'
        : `https://microspot.dev`;
export const REDIRECT_URL = `${APP_URL}/callback`;
export const SCOPES = [
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-position',
    'user-read-private',
    'user-read-email',
    'user-read-playback-position',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control',
    'streaming',
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-modify',
    'user-follow-read',
    'user-library-modify',
    'user-library-read',
    'ugc-image-upload'
];

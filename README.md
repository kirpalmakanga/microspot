# Environment

.env file

```
APP_URL=[your_app_url]
APP_REDIRECT_URL=[your_app_url]/callback
CLIENT_ID=[your_spotify_client_id]
CLIENT_SECRET=[your_spotify_client_secret]
```

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

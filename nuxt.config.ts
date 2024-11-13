export default defineNuxtConfig({
    ssr: false,
    modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
    imports: {
        dirs: ['composables/**']
    },
    css: ['~/assets/style/main.scss'],
    hooks: {
        // TODO: remove after next upxate
        'vite:extend'({ config }) {
            if (config.server && config.server.hmr) {
                //@ts-ignore
                config.server.hmr.protocol = 'wss';
            }
        }
    },
    compatibilityDate: '2024-10-30'
});

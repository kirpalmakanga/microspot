export default defineNuxtConfig({
    ssr: false,
    modules: ['@nuxt/ui', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],
    imports: {
        dirs: ['composables/**']
    },
    css: ['~/assets/style/main.scss'],
    compatibilityDate: '2024-10-30',
    vite: {
        server: {
            allowedHosts: true
        }
    }
});

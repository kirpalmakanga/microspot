export default defineNuxtConfig({
    ssr: false,
    modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/colada-nuxt', 'pinia-plugin-persistedstate/nuxt'],
    imports: {
        dirs: ['composables/**']
    },
    css: ['~/assets/style/main.scss'],
    vite: {
        server: {
            allowedHosts: true
        }
    }
});

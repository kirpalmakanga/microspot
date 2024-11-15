export default defineNuxtConfig({
    ssr: true,
    modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
    imports: {
        dirs: ['composables/**']
    },
    css: ['~/assets/style/main.scss'],
    compatibilityDate: '2024-10-30'
});

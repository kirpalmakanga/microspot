<template>
    <main
        class="flex flex-col grow min-h-screen bg-zinc-800 overflow-hidden font-sans"
    >
        <UApp>
            <!-- <Transition name="fade" mode="out-in"> -->
            <NuxtLayout />
            <!-- </Transition> -->

            <Player v-if="isLoggedIn && $route.name !== 'login'" />
        </UApp>
    </main>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);
</script>

<style>
@import 'tailwindcss';
@import '@nuxt/ui';

@theme {
    --font-family-sans: 'Montserrat', 'sans-serif';
}
</style>

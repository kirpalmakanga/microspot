<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools';
</script>

<style>
@import 'tailwindcss';
@import '@nuxt/ui';

@theme {
    --font-family-sans: 'Montserrat', 'sans-serif';
}
</style>

<template>
    <main class="flex flex-col grow min-h-screen bg-zinc-800 overflow-hidden font-sans">
        <UApp>
            <NuxtLayout />
        </UApp>
    </main>

    <PiniaColadaDevtools />
</template>

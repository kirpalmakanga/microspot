<script setup lang="ts">
const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);
</script>

<template>
    <LayoutHeader />

    <NuxtPage />

    <Player v-if="isLoggedIn && $route.name !== 'login'" />
</template>

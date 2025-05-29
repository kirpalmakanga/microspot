<script setup lang="ts">
import { redirectToLogIn } from '~/services/auth-api';
</script>

<template>
    <section class="flex flex-col grow items-center justify-center p-4">
        <UButton
            class="cursor-pointer hover:scale-110 hover:active:scale-90 transition-transform"
            type="button"
            icon="i-mi-log-in"
            @click="redirectToLogIn"
        >
            Log in
        </UButton>
    </section>
</template>

<template>
    <section class="flex flex-col grow">
        <LayoutHeader title="MicroSpot" />

        <div class="flex flex-col grow items-center justify-center p-4">
            <UButton
                class="cursor-pointer hover:scale-110 hover:active:scale-90 transition-transform"
                type="button"
                icon="i-mi-log-in"
                @click="logIn"
            >
                Log in
            </UButton>
        </div>
    </section>
</template>

<script setup lang="ts">
const { logIn } = useAuthStore();
</script>

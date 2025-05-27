<template>
    <div class="flex flex-col grow items-center justify-center gap-2 p-4">
        <UIcon class="size-12" :name="icon" />

        <p v-if="text">{{ text }}</p>

        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; text?: string }>();
</script>

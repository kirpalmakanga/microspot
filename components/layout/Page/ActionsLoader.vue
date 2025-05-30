<script setup lang="ts">
defineProps<{ hasPlayButton?: boolean }>();
</script>

<template>
    <div class="flex items-center gap-4 p-4">
        <USkeleton v-if="hasPlayButton" class="size-16 bg-zinc-600" />

        <USkeleton class="size-8 bg-zinc-600" />
    </div>
</template>

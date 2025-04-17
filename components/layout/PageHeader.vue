<script setup lang="ts">
defineProps<{
    type?: string;
    cover: string;
    title: string;
    description?: string;
}>();
</script>

<template>
    <div class="flex items-end bg-zinc-500 p-4 gap-4">
        <div class="group relative overflow-hidden rounded-md flex-shrink-0">
            <Img class="size-48 bg-zinc-700" :src="cover" />

            <slot name="cover-overlay" />
        </div>

        <div class="flex flex-col gap-2 overflow-hidden">
            <p v-if="type">{{ type }}</p>

            <h1 class="text-4xl font-secondary">
                {{ title }}
            </h1>

            <slot name="subtitles" />
        </div>
    </div>
</template>

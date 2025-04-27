<script setup lang="ts">
defineProps<{
    title: string;
    subtitle?: string;
    cover: string;
    href: string;
    isPlaying: boolean;
}>();

defineEmits<{ togglePlay: [e: void] }>();
</script>

<template>
    <div
        class="flex flex-col bg-zinc-600 hover:bg-zinc-500 shadow transition-colors p-4 rounded-md group cursor-pointer"
        @click="() => $router.push(href)"
    >
        <div class="relative bg-zinc-700 rounded-md overflow-hidden">
            <Img class="aspect-square h-full" :src="cover" />

            <PlayButton
                class="absolute top-1/2 left-1/2 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition transform -translate-x-1/2 -translate-y-1/2"
                :is-playing="isPlaying"
                @click.stop="$emit('togglePlay')"
            />
        </div>

        <div class="flex flex-col grow justify-end overflow-hidden mt-4">
            <NuxtLink class="truncate" :href="href">
                {{ title }}
            </NuxtLink>

            <div v-if="subtitle" class="text-sm opacity-60 truncate">
                {{ subtitle }}
            </div>
        </div>
    </div>
</template>

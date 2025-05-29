<script setup lang="ts">
const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

defineProps<{ items: Album[] }>();
</script>

<template>
    <ul
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
        <li v-for="{ id, name, images, itemCount, uri } in items" :key="id">
            <Card
                :title="name"
                :subtitle="`${itemCount} track${
                    itemCount === 0 || itemCount > 1 ? 's' : ''
                }`"
                :cover="images.medium || images.large"
                :href="`/album/${id}`"
                :is-playing="isCurrentContext(uri) && isPlaying"
                @toggle-play="togglePlay({ contextUri: uri })"
            />
        </li>
    </ul>
</template>

<script setup lang="ts">
const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

defineProps<{ items: Playlist[]; isUserNameVisible?: boolean }>();
</script>

<template>
    <ul
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
        <li
            v-for="{ id, name, images, totalItemCount, uri } of items"
            :key="id"
        >
            <Card
                :title="name"
                :subtitle="`${totalItemCount} track${
                    totalItemCount === 0 || totalItemCount > 1 ? 's' : ''
                }`"
                :cover="images.medium || images.large"
                :href="`/playlist/${id}`"
                :is-playing="isCurrentContext(uri) && isPlaying"
                @toggle-play="
                    togglePlay({
                        contextUri: uri
                    })
                "
            />
        </li>
    </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
    type: 'playlist' | 'album';
    contextUri: string;
    items: TracklistItem[];
}>();

const emit = defineEmits<{
    toggleSaveTrack: [trackId: string];
    deleteTrack: [trackId: string];
}>();

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);
</script>

<template>
    <ul class="relative grow">
        <li v-for="({ uri: trackUri, ...data }, index) in items" :key="data.id">
            <TracklistItem
                v-bind="data"
                :is-playlist-item="props.type === 'playlist'"
                :index="index + 1"
                :is-current="isCurrentContext(contextUri, trackUri)"
                :is-playing="
                    isCurrentContext(contextUri, trackUri) && isPlaying
                "
                @save="emit('toggleSaveTrack', data.id)"
                @delete="emit('deleteTrack', data.id)"
                @toggle-play="togglePlay({ contextUri, trackUri })"
            />
        </li>
    </ul>
</template>

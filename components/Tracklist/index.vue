<script setup lang="ts">
const props = defineProps<{
    type: 'playlist' | 'album';
    contextUri: string;
    items: TracklistItem[];
}>();

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const { toggleSavePlaylistTrack, removePlaylistTrack } = usePlaylistStore();
// const { toggleSaveAlbumTrack } = useAlbumStore();

function toggleSaveTrack(trackId: string) {
    switch (props.type) {
        case 'playlist':
            toggleSavePlaylistTrack(trackId);
            break;
        case 'album':
            // toggleSaveAlbumTrack(trackId);
            break;
    }
}
</script>

<template>
    <ul class="relative grow">
        <li v-for="({ uri: trackUri, ...data }, index) in items">
            <TracklistItem
                v-bind="data"
                :is-playlist-item="props.type === 'playlist'"
                :index="index + 1"
                :is-current="isCurrentContext(contextUri, trackUri)"
                :is-playing="
                    isCurrentContext(contextUri, trackUri) && isPlaying
                "
                @save="toggleSaveTrack(data.id)"
                @delete="removePlaylistTrack(data.id)"
                @toggle-play="togglePlay({ contextUri, trackUri })"
            />
        </li>
    </ul>
</template>

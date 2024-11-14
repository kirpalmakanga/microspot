<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        type: 'playlist' | 'album';
        contextUri: string;
        items: TracklistItem[];
        scrollOffsetPercent?: number;
    }>(),
    { scrollOffsetPercent: 30 }
);

const emit = defineEmits<{
    'reached-bottom': [e: void];
}>();

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const { toggleSavePlaylistTrack, removePlaylistTrack } = usePlaylistStore();
const { toggleSaveAlbumTrack } = useAlbumStore();

function toggleSaveTrack(trackId: string) {
    switch (props.type) {
        case 'playlist':
            toggleSavePlaylistTrack(trackId);
            break;
        case 'album':
            toggleSaveAlbumTrack(trackId);
            break;
    }
}

function handleScrollEnd({ currentTarget }: ElementEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, offsetHeight } = currentTarget;

    if (
        scrollTop >=
        scrollHeight -
            offsetHeight -
            (props.scrollOffsetPercent / 100) * scrollHeight
    ) {
        emit('reached-bottom');
    }
}
</script>

<template>
    <div class="relative grow overflow-hidden">
        <RecycleScroller
            class="!absolute inset-0"
            :items="items"
            :item-size="60"
            :skip-hover="true"
            key-field="id"
            v-slot="{ item: { uri: trackUri, trackNumber, ...data }, index }"
            @scrollend="handleScrollEnd"
        >
            <TracklistItem
                v-bind="data"
                :is-playlist-item="props.type === 'playlist'"
                :index="trackNumber || index + 1"
                :is-current="isCurrentContext(contextUri, trackUri)"
                :is-playing="
                    isCurrentContext(contextUri, trackUri) && isPlaying
                "
                @save="toggleSaveTrack(data.id)"
                @delete="removePlaylistTrack(data.id)"
                @toggle-play="togglePlay({ contextUri, trackUri })"
            />
        </RecycleScroller>
    </div>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const props = defineProps<{ trackData: Pick<Track, 'id' | 'name' | 'artists' | 'isSaved'> }>();

const playerStore = usePlayerStore();

const { toggleSaveCurrentTrack } = playerStore;

const copy = useCopy();

const isPlaylistMenuOpen = ref<boolean>(false);

const playlistMenuTitle = computed(() => {
    const {
        trackData: { name, artists }
    } = props;

    return `${artists.map(({ name }) => name).join(', ')} - ${name}`;
});

const trackMenuOptions = computed<ContextMenuItem[]>(() => {
    const {
        trackData: { id, isSaved }
    } = props;

    return [
        {
            icon: 'i-mi-add',
            label: 'Add to playlist',
            onSelect: () => (isPlaylistMenuOpen.value = true)
        },
        {
            icon: isSaved ? 'i-mi-circle-check' : 'i-mi-circle-add',
            label: isSaved ? 'Remove from liked tracks' : 'Save to liked tracks',
            onSelect: () => toggleSaveCurrentTrack()
        },
        {
            icon: 'i-mi-share',
            label: 'Share',
            onSelect: () => copy(`${window.location.origin}/track/${id}`)
        }
    ];
});
</script>

<template>
    <UContextMenu :items="trackMenuOptions"><slot /></UContextMenu>

    <PlaylistMenu
        v-model:open="isPlaylistMenuOpen"
        :track-data="trackData"
        :title="playlistMenuTitle"
    />
</template>

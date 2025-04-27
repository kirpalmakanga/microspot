<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
interface State {
    isLoading: boolean;
    isLoadingTracks: boolean;
    isEditFormOpen: boolean;
}

const {
    params: { playlistId }
} = useRoute();

const playlistStore = usePlaylistStore();
const { getPlaylist, getPlaylistTracks, getSavedTracks, clearPlaylistData } =
    playlistStore;
const {
    images,
    name,
    description,
    totalItemCount,
    tracks,
    uri,
    hasLoadedAllTracks
} = storeToRefs(playlistStore);

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const copy = useCopy();

const state = reactive<State>({
    isLoading: true,
    isLoadingTracks: false,
    isEditFormOpen: false
});

const cover = computed(() => images.value.medium || images.value.large);

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/album/${playlistId}`)
    }
];

async function loadData() {
    if (playlistId === 'saved') {
        name.value = 'Saved tracks';

        await getSavedTracks();
    } else {
        await getPlaylist(playlistId as string);
    }

    state.isLoading = false;
}

async function loadTracks() {
    if (state.isLoadingTracks) {
        return;
    }

    state.isLoadingTracks = true;

    if (playlistId === 'saved') {
        await getSavedTracks();
    } else {
        await getPlaylistTracks(playlistId as string);
    }

    state.isLoadingTracks = false;
}

useAppTitle(name);

onMounted(loadData);

onUnmounted(clearPlaylistData);
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="state.isLoading" />

            <div v-else class="relative flex flex-col grow">
                <LayoutPageHeader type="Playlist" :cover="cover" :title="name">
                    <template #cover-overlay>
                        <button
                            class="absolute inset-0 flex items-center justify-center bg-zinc-900/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity cursor-pointer"
                            @click="state.isEditFormOpen = true"
                        >
                            <UIcon class="size-12" name="i-mi-edit" />
                        </button>
                    </template>

                    <template #subtitles>
                        <p v-if="description" class="opacity-80">
                            <Ellipsis has-tooltip>
                                <span v-html="description"></span>
                            </Ellipsis>
                        </p>

                        <p class="text-sm opacity-60">
                            {{
                                `${totalItemCount} track${
                                    totalItemCount === 1 ? '' : 's'
                                }`
                            }}
                        </p>
                    </template>
                </LayoutPageHeader>

                <div class="flex items-center gap-4 p-4">
                    <PlayButton
                        :is-playing="isCurrentContext(uri) && isPlaying"
                        @click="togglePlay({ contextUri: uri })"
                    />

                    <MenuButton :menu-options="menuOptions" />
                </div>

                <TracklistVirtualized
                    class="bg-zinc-700"
                    type="playlist"
                    :context-uri="uri"
                    :items="tracks"
                    @reached-bottom="
                        !state.isLoadingTracks &&
                            !hasLoadedAllTracks &&
                            loadTracks()
                    "
                />
            </div>
        </Transition>
    </section>

    <PlaylistEditForm
        v-if="!state.isLoading"
        v-model:is-open="state.isEditFormOpen"
        :cover="cover"
        :name="name"
        :description="description"
    />
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const {
    params: { playlistId }
} = useRoute();

const {
    data: playlist,
    isLoading,
    isFetching,
    isError,
    refetch
} = usePlaylist(playlistId as string);

const {
    data: playlistTracks,
    isLoading: isLoadingTracks,
    isFetching: isFetchingTracks,
    isError: isTracksError,
    hasNextPage,
    fetchNextPage
} = usePlaylistTracks(playlistId as string);

const { mutate: toggleSavePlaylistTrack } = useToggleSavePlaylistTrack(
    playlistId as string
);
const { mutate: removePlaylistTrack } = useRemovePlaylistTrack(
    playlistId as string
);

const tracks = computed(() => playlistTracks.value?.pages.flat());

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const copy = useCopy();

const isEditFormOpen = ref<boolean>(false);

const cover = computed(
    () => playlist.value?.images.large || playlist.value?.images.medium
);

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/playlist/${playlistId}`)
    }
];

useAppTitle(computed(() => playlist.value?.name));
</script>

<template>
    <section class="flex flex-col grow">
        <template v-if="isLoading || (isError && isFetching)">
            <LayoutPageHeaderLoader />

            <LayoutPageActionsLoader has-play-button />

            <TracklistItemLoader />
        </template>

        <Error v-else-if="isError" @action="refetch()" />

        <div v-else-if="playlist" class="relative flex flex-col grow">
            <LayoutPageHeader
                type="Playlist"
                :cover="cover"
                :title="playlist.name"
            >
                <template #cover-overlay>
                    <button
                        class="absolute inset-0 flex items-center justify-center bg-zinc-900/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity cursor-pointer"
                        @click="isEditFormOpen = true"
                    >
                        <UIcon class="size-12" name="i-mi-edit" />
                    </button>
                </template>

                <template #subtitles>
                    <p v-if="playlist.description" class="opacity-80">
                        <Ellipsis has-tooltip>
                            <span v-html="playlist.description"></span>
                        </Ellipsis>
                    </p>

                    <p class="text-sm opacity-60">
                        {{
                            `${playlist.totalItemCount} track${
                                playlist.totalItemCount === 1 ? '' : 's'
                            }`
                        }}
                    </p>
                </template>
            </LayoutPageHeader>

            <div class="flex items-center gap-4 p-4">
                <PlayButton
                    :is-playing="isCurrentContext(playlist.uri) && isPlaying"
                    @click="togglePlay({ contextUri: playlist.uri })"
                />

                <MenuButton :menu-options="menuOptions" />
            </div>

            <TracklistItemLoader v-if="isLoadingTracks" />

            <TracklistVirtualized
                v-if="tracks"
                class="bg-zinc-700"
                type="playlist"
                :context-uri="playlist.uri"
                :items="tracks"
                @toggle-save-track="toggleSavePlaylistTrack"
                @delete-track="removePlaylistTrack"
                @reached-bottom="hasNextPage && fetchNextPage()"
            />

            <!-- <TracklistItemLoader v-if="hasNextPage && isFetchingTracks" /> -->

            <UModal v-model:open="isEditFormOpen" title="Edit details">
                <template #body>
                    <PlaylistEditForm
                        v-model:is-open="isEditFormOpen"
                        :playlist-id="playlist.id"
                        :cover="cover"
                        :name="playlist.name"
                        :description="playlist.description"
                        @saved="isEditFormOpen = false"
                    />
                </template>
            </UModal>
        </div>
    </section>
</template>

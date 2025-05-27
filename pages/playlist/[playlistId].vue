<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const {
    params: { playlistId }
} = useRoute();

const {
    data: playlist,
    isLoading,
    refetch
} = usePlaylist(playlistId as string);

const {
    data: playlistTracks,
    isLoading: isLoadingTracks,
    isFetching: isFetchingTracks,
    isError,
    hasNextPage,
    fetchNextPage
} = usePlaylistTracks(playlistId as string);

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

useHead({
    title: () => playlist.value?.name
});
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="isLoading" />

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
                        :is-playing="
                            isCurrentContext(playlist.uri) && isPlaying
                        "
                        @click="togglePlay({ contextUri: playlist.uri })"
                    />

                    <MenuButton :menu-options="menuOptions" />
                </div>

                <Loader v-if="isLoadingTracks" />

                <TracklistVirtualized
                    v-if="tracks"
                    class="bg-zinc-700"
                    type="playlist"
                    :context-uri="playlist.uri"
                    :items="tracks"
                    @reached-bottom="hasNextPage && fetchNextPage()"
                />

                <!-- <Transition v-if="hasNextPage" name="fade" mode="out-in">
                    <Loader v-if="isFetchingTracks" />
                </Transition> -->

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
        </Transition>
    </section>
</template>

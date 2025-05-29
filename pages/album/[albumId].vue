<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { useDateFormat } from '@vueuse/core';

const {
    params: { albumId }
} = useRoute();

const {
    data: album,
    isLoading: isLoadingAlbum,
    isError: hasAlbumError,
    refetch: refetchAlbum
} = useAlbum(albumId as string);

const cover = computed(
    () => album.value?.images.medium || album.value?.images.large
);

const formattedReleaseDate = useDateFormat(
    computed(() => album.value?.releaseDate),
    'YYYY'
);

const {
    data: albumTracks,
    isLoading: isLoadingTracks,
    isError: hasTracksError,
    hasNextPage,
    fetchNextPage,
    refetch: refetchTracks
} = useAlbumTracks(albumId as string);

const tracks = computed(() => albumTracks.value?.pages.flat());

const { mutate: toggleSaveAlbum } = useToggleSaveAlbum(albumId as string);

const { mutate: toggleSaveAlbumTrack } = useToggleSaveAlbumTrack(
    albumId as string
);

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const copy = useCopy();

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/album/${albumId}`)
    }
];

useAppTitle(computed(() => album.value?.name));
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="isLoadingAlbum" />

            <Error v-else-if="hasAlbumError" @action="refetchAlbum()" />

            <div v-else-if="album" class="relative flex flex-col grow">
                <LayoutPageHeader
                    :type="album.albumType"
                    :cover="cover"
                    :title="album.name"
                >
                    <template #subtitles>
                        <p class="flex gap-1">
                            <template
                                v-for="({ id, name }, index) of album.artists"
                            >
                                <span v-if="index > 0">,</span>

                                <span v-if="id === '0LyfQWJT6nXafLPZqxe9Of'">
                                    {{ name }}
                                </span>

                                <NuxtLink
                                    v-else
                                    class="opacity-80 hover:opacity-100 transition-opacity hover:underline"
                                    :to="`/artist/${id}`"
                                >
                                    {{ name }}
                                </NuxtLink>
                            </template>
                        </p>

                        <p class="opacity-60">
                            <span>
                                {{
                                    `${album.itemCount} track${
                                        album.itemCount === 1 ? '' : 's'
                                    }`
                                }}
                            </span>
                            |
                            <span>{{ formattedReleaseDate }}</span>
                        </p>
                    </template>
                </LayoutPageHeader>

                <div class="flex items-center gap-4 p-4">
                    <PlayButton
                        :disabled="!album.isPlayable"
                        :is-playing="isCurrentContext(album.uri) && isPlaying"
                        @click="togglePlay({ contextUri: album.uri })"
                    />

                    <button
                        class="transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer"
                        @click="toggleSaveAlbum()"
                    >
                        <UIcon
                            class="size-8"
                            :name="
                                album.isSaved
                                    ? 'i-mi-circle-check'
                                    : 'i-mi-circle-add'
                            "
                        />
                    </button>

                    <MenuButton :menu-options="menuOptions" />
                </div>

                <Loader v-if="isLoadingTracks" />

                <Error v-else-if="hasTracksError" @action="refetchTracks()" />

                <TracklistVirtualized
                    v-else-if="tracks"
                    class="bg-zinc-700"
                    type="album"
                    :context-uri="album.uri"
                    :items="tracks"
                    @toggle-save-track="toggleSaveAlbumTrack"
                    @reached-bottom="hasNextPage && fetchNextPage()"
                />
            </div>
        </Transition>
    </section>
</template>

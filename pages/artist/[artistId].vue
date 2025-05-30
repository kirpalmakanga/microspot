<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const {
    params: { artistId }
} = useRoute();

const {
    data: artist,
    isLoading: isLoadingArtist,
    isError: isArtistError,
    isFetching: isFetchingArtist,
    refetch: refetchArtist
} = useArtist(artistId as string);

const cover = computed(
    () => artist.value?.images.medium || artist.value?.images.large
);

const {
    data: artistAlbums,
    isLoading: isLoadingAlbums,
    isError: hasAlbumsError,
    hasNextPage,
    fetchNextPage,
    refetch: refetchAlbums
} = useArtistAlbums(artistId as string);

const albums = computed(() =>
    (artistAlbums.value?.pages || []).reduce(
        (result, { albums, albumCount }) => {
            if (albums.length) {
                result.items.push(...albums);
            }

            if (!result.albumCount) {
                result.albumCount = albumCount;
            }

            return result;
        },
        { items: [], albumCount: 0 } as { items: Album[]; albumCount: number }
    )
);

const copy = useCopy();

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/artist/${artistId}`)
    }
];

useAppTitle(computed(() => artist.value?.name));
</script>

<template>
    <section class="flex flex-col grow">
        <template v-if="isLoadingArtist || (isArtistError && isFetchingArtist)">
            <LayoutPageHeaderLoader />

            <LayoutPageActionsLoader />

            <PlaylistGridLoader class="bg-zinc-700 grow" />
        </template>

        <Error v-else-if="isArtistError" @action="refetchArtist()" />

        <div v-else-if="artist" class="relative flex flex-col grow">
            <LayoutPageHeader type="Artist" :cover="cover" :title="artist.name">
                <template #subtitles>
                    <p class="text-sm opacity-60">
                        {{
                            `${albums.albumCount || 0} album${
                                albums.albumCount === 1 ? '' : 's'
                            }`
                        }}
                    </p>
                </template>
            </LayoutPageHeader>

            <div class="flex items-center gap-4 p-4">
                <MenuButton :menu-options="menuOptions" />
            </div>

            <PlaylistGridLoader
                class="bg-zinc-700 grow"
                v-if="isLoadingAlbums"
            />

            <Error v-else-if="hasAlbumsError" @action="refetchAlbums()" />

            <ScrollContainer
                v-else-if="albums.items.length"
                class="bg-zinc-700"
                scrollable-class="p-4"
                @reached-bottom="hasNextPage && fetchNextPage()"
            >
                <AlbumGrid :items="albums.items" />
            </ScrollContainer>

            <Placeholder
                v-else
                class="bg-zinc-700"
                icon="i-mi-list"
                text="This artist hasn't released anything yet."
            />
        </div>
    </section>
</template>

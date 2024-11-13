<template>
    <section class="flex flex-col grow">
        <LayoutHomeHeader />

        <div class="relative flex flex-col grow">
            <h2 class="p-4">Recent playlists</h2>

            <ScrollContainer
                v-if="!isLoading"
                @reached-bottom="!hasLoadedAllPlaylists && loadMoreItems()"
            >
                <div class="flex flex-col grow px-4 pb-4">
                    <PlaylistGrid
                        v-if="currentUserPlaylists.length"
                        :items="currentUserPlaylists"
                    />

                    <Placeholder
                        v-else
                        icon="i-mi-list"
                        text="You have no playlists."
                    />
                </div>
            </ScrollContainer>

            <Transition name="fade" mode="out-in">
                <Loader v-if="isLoading || isLoadingMore" />
            </Transition>
        </div>
    </section>
</template>

<script setup lang="ts">
const playlistsStore = usePlaylistsStore();
const { hasLoadedAllPlaylists, currentUserPlaylists } =
    storeToRefs(playlistsStore);
const { getCurrentUserPlaylists } = playlistsStore;

const isLoading = ref<boolean>(true);
const isLoadingMore = ref<boolean>(false);

const loadItems = (loadingRef: Ref<boolean>) => async () => {
    if (loadingRef === isLoadingMore && loadingRef.value) return;

    loadingRef.value = true;

    await getCurrentUserPlaylists();

    loadingRef.value = false;
};

const loadMoreItems = loadItems(isLoadingMore);

useAppTitle('Dashboard');

definePageMeta({
    middleware: 'authenticated'
});

onMounted(loadItems(isLoading));
</script>

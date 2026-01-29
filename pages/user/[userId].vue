<script setup lang="ts">
const {
    params: { userId }
} = useRoute();

const {
    data: user,
    isPending: isUserPending,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser
} = useUser(userId as string);

const {
    data: playlistData,
    isPending: arePlaylistsPending,
    isLoading: arePlaylistsLoading,
    error: playlistsError,
    refetch: refetchPlaylists,
    hasNextPage,
    loadNextPage
} = useUserPlaylists(userId as string);

const playlists = computed(() => playlistData.value?.pages.flatMap(({ items }) => items));

useHead({
    title: () => user.value?.name
});
</script>

<template>
    <section class="flex flex-col grow">
        <template v-if="isUserPending || (userError && isUserLoading)">
            <LayoutPageHeaderLoader />

            <USkeleton class="h-6 mx-4 mt-4 w-1/2 bg-zinc-500" />

            <PlaylistGridLoader />
        </template>

        <Error v-else-if="userError" @action="refetchUser()" />

        <div v-else-if="user" class="flex flex-col grow">
            <LayoutPageHeader type="User" :cover="user.profilePicture" :title="user.name">
                <template v-if="playlists" #subtitles>
                    <p class="text-sm opacity-60">
                        {{ `${playlists.length} playlist${playlists.length === 1 ? '' : 's'}` }}
                    </p>
                </template>
            </LayoutPageHeader>

            <PlaylistGridLoader
                v-if="arePlaylistsPending || (playlistsError && arePlaylistsLoading)"
            />

            <Error v-else-if="playlistsError" @action="refetchPlaylists()" />

            <ScrollContainer
                v-else-if="playlists"
                class="bg-zinc-700"
                @reached-bottom="hasNextPage && loadNextPage()"
            >
                <div class="p-4">
                    <h2 class="mb-4">Playlists</h2>

                    <PlaylistGrid
                        v-if="playlists.length"
                        :items="playlists"
                        :is-user-name-visible="false"
                    />

                    <Placeholder
                        v-else
                        icon="i-mi-list"
                        text="This user hasn't created playlists yet."
                    />
                </div>
            </ScrollContainer>

            <!-- <Transition v-if="hasNextPage" name="fade" mode="out-in">
                <Loader v-if="arePlaylistsLoading" />
            </Transition> -->
        </div>
    </section>
</template>

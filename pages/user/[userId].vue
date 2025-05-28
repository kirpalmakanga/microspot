<script setup lang="ts">
const {
    params: { userId }
} = useRoute();

const {
    data: user,
    isLoading: isLoadingUser,
    isError: hasUserError,
    refetch
} = useUser(userId as string);

const authStore = useAuthStore();
const {
    data: playlistData,
    isLoading: isLoadingPlaylists,
    isFetching: isFetchingPlaylists,
    hasNextPage,
    isError: hasPlaylistsError,
    refetch: refetchPlaylists,
    fetchNextPage
} = useUserPlaylists(userId as string);

const playlists = computed(() =>
    playlistData.value?.pages.flatMap(({ items }) => items)
);

useHead({
    title: () => user.value?.name
});
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="isLoadingUser" />

            <Error v-else-if="hasUserError" @action="refetch()" />

            <div v-else-if="user" class="flex flex-col grow">
                <LayoutPageHeader
                    type="User"
                    :cover="user.profilePicture"
                    :title="user.name"
                >
                    <template v-if="playlists" #subtitles>
                        <p class="text-sm opacity-60">
                            {{
                                `${playlists.length} playlist${
                                    playlists.length === 1 ? '' : 's'
                                }`
                            }}
                        </p>
                    </template>
                </LayoutPageHeader>

                <Loader v-if="isLoadingPlaylists" />

                <Error
                    v-else-if="hasPlaylistsError"
                    @action="refetchPlaylists()"
                />

                <ScrollContainer
                    v-else-if="playlists"
                    class="bg-zinc-700"
                    @reached-bottom="hasNextPage && fetchNextPage()"
                >
                    <div class="p-4">
                        <h2 class="mb-4">Recent playlists</h2>

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

                <Transition v-if="hasNextPage" name="fade" mode="out-in">
                    <Loader v-if="isFetchingPlaylists" />
                </Transition>
            </div>
        </Transition>
    </section>
</template>

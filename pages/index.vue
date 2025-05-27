<script setup lang="ts">
const authStore = useAuthStore();
const {
    data,
    isLoading,
    isFetching,
    isError,
    hasNextPage,
    refetch,
    fetchNextPage
} = useUserPlaylists(computed(() => authStore.userId));

const playlists = computed(() =>
    data.value?.pages.flatMap(({ items }) => items)
);

useAppTitle('Dashboard');

definePageMeta({
    middleware: 'authenticated'
});
</script>

<template>
    <section class="flex flex-col grow">
        <div class="relative flex flex-col grow">
            <h2 class="p-4">Recent playlists</h2>

            <Loader v-if="isLoading" />

            <Error v-else-if="isError" @action="refetch()" />

            <ScrollContainer
                v-else-if="playlists"
                @reached-bottom="hasNextPage && fetchNextPage()"
            >
                <div class="flex flex-col grow px-4 pb-4">
                    <PlaylistGrid v-if="playlists.length" :items="playlists" />

                    <Placeholder
                        v-else
                        icon="i-mi-list"
                        text="You haven't created playlists yet."
                    />
                </div>
            </ScrollContainer>

            <Transition v-if="hasNextPage" name="fade" mode="out-in">
                <Loader v-if="isFetching && !isLoading" />
            </Transition>
        </div>
    </section>
</template>

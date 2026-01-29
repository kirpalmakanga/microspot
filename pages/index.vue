<script setup lang="ts">
const authStore = useAuthStore();
const {
    data: playlists,
    isPending,
    isLoading,
    error,
    refetch,
    hasNextPage,
    loadNextPage
} = useUserPlaylists(computed(() => authStore.userId));

const items = computed(() => playlists.value?.pages.flatMap(({ items }) => items));

useAppTitle('Dashboard');

definePageMeta({
    middleware: 'authenticated'
});
</script>

<template>
    <section class="flex flex-col grow">
        <div class="relative flex flex-col grow">
            <h2 class="p-4">Playlists</h2>

            <PlaylistGridLoader class="py-0" v-if="isPending || (error && isLoading)" />

            <Error v-else-if="error" @action="refetch()" />

            <ScrollContainer v-else-if="items" @reached-bottom="hasNextPage && loadNextPage()">
                <div class="flex flex-col grow px-4 pb-4">
                    <PlaylistGrid v-if="items.length" :items="items" />

                    <Placeholder
                        v-else
                        icon="i-mi-list"
                        text="You haven't created playlists yet."
                    />
                </div>
            </ScrollContainer>

            <!-- <Transition v-if="hasNextPage" name="fade" mode="out-in">
                <Loader v-if="isFetching && !isLoading" />
            </Transition> -->
        </div>
    </section>
</template>

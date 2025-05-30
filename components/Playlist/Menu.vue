<script setup lang="ts">
const { trackId } = defineProps<{ trackId: string }>();

const emit = defineEmits<{ saved: [e: void] }>();

const authStore = useAuthStore();

/** TODO, handle next pages and error */
const {
    data,
    isLoading,
    isFetching,
    isError,
    hasNextPage,
    refetch,
    fetchNextPage
} = useUserPlaylists(authStore.userId);

const { mutate: addPlaylistTrack } = useAddPlaylistTrack();

const query = ref<string>('');

const currentItems = computed(() => {
    return (data.value?.pages || [])
        .flatMap(({ items }) => items)
        .filter(({ name }) =>
            name.toLowerCase().includes(query.value.toLowerCase())
        );
});

function handleSelectPlaylist(playlistId?: string) {
    addPlaylistTrack({ playlistId, trackId });

    emit('saved');
}
</script>

<template>
    <div class="flex flex-col gap-2 grow h-[50dvh]">
        <UInput
            variant="soft"
            size="xl"
            type="text"
            placeholder="Find a playlist"
            v-model="query"
        >
            <template v-if="query" #trailing>
                <UButton
                    class="rounded-none rounded-r-md -me-2.5 cursor-pointer"
                    icon="i-mi-close"
                    variant="soft"
                    color="neutral"
                    @click="query = ''"
                />
            </template>
        </UInput>

        <button
            class="flex items-center p-2 rounded-md hover:bg-zinc-800 transition-colors w-full"
            @click="handleSelectPlaylist()"
        >
            <UIcon class="size-6 mr-2" name="i-mi-add" />

            New playlist
        </button>

        <PlaylistMenuLoader v-if="isLoading || (isError && isFetching)" />

        <Error v-else-if="isError" @action="refetch()" />

        <ScrollContainer
            v-else
            class="grow"
            @reached-bottom="hasNextPage && fetchNextPage()"
        >
            <ul>
                <li v-for="{ id, name, images } of currentItems" :key="id">
                    <button
                        class="flex items-center p-2 gap-2 rounded-md hover:bg-zinc-800 transition-colors w-full cursor-pointer overflow-hidden text-left"
                        @click="handleSelectPlaylist(id)"
                    >
                        <Img
                            class="flex-shrink-0 size-8 rounded"
                            :src="images.small || images.medium || images.large"
                        />

                        <span class="truncate grow">
                            {{ name }}
                        </span>
                    </button>
                </li>
            </ul>
        </ScrollContainer>
    </div>
</template>

<script setup lang="ts">
const router = useRouter();
const props = defineProps<{ trackId: string }>();

const playlistsStore = usePlaylistsStore();
const { items } = storeToRefs(playlistsStore);
const { getCurrentUserPlaylists, createPlaylist, addPlaylistTrack } =
    playlistsStore;

const isLoading = ref<boolean>(true);
const query = ref<string>('');

const currentItems = computed(() => {
    return items.value.filter(({ name }) =>
        name.toLowerCase().includes(query.value.toLowerCase())
    );
});

async function handleSelectPlaylist(playlistId?: string) {
    let id = playlistId;

    if (!playlistId) {
        id = await createPlaylist('New playlist');

        await addPlaylistTrack(id, props.trackId);

        router.push(`/playlist/${id}`);
    }
}

onMounted(async () => {
    await getCurrentUserPlaylists();

    isLoading.value = false;
});
</script>

<template>
    <Loader v-if="isLoading" />

    <div class="flex flex-col gap-2 grow sm:h-[50dvh]" v-else>
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

        <ScrollContainer class="grow">
            <ul>
                <li v-for="{ id, name, images } of currentItems">
                    <button
                        class="flex items-center p-2 gap-2 rounded-md hover:bg-zinc-800 transition-colors w-full cursor-pointer overflow-hidden text-left"
                        @click="handleSelectPlaylist(id)"
                    >
                        <Img
                            class="flex-shrink-0 size-8"
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

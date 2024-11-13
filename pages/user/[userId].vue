<script setup lang="ts">
const route = useRoute();
const userStore = useUserStore();
const { name, profilePicture } = storeToRefs(userStore);
const { getUserData } = userStore;

const playlistsStore = usePlaylistsStore();
const { userPlaylists } = storeToRefs(playlistsStore);
const { getUserPlaylists, clearPlaylists } = playlistsStore;

const isLoading = ref<boolean>(true);

const loadData = async () => {
    const {
        params: { userId }
    } = route;

    await Promise.all([
        getUserData(userId as string),
        getUserPlaylists(userId as string)
    ]);

    isLoading.value = false;
};

useAppTitle(name);

onMounted(loadData);

onUnmounted(() => clearPlaylists(route.params.userId as string));
</script>

<template>
    <section class="flex flex-col grow">
        <LayoutDefaultHeader />

        <div v-if="!isLoading" class="flex flex-col grow">
            <LayoutPageHeader type="User" :cover="profilePicture" :title="name">
                <template #subtitles>
                    <p class="text-sm opacity-60">
                        {{
                            `${userPlaylists.length} playlist${
                                userPlaylists.length === 1 ? '' : 's'
                            }`
                        }}
                    </p>
                </template>
            </LayoutPageHeader>

            <ScrollContainer class="bg-zinc-700">
                <div class="p-4">
                    <h2 class="mb-4">Recent playlists</h2>

                    <PlaylistGrid
                        :items="userPlaylists"
                        :is-user-name-visible="false"
                    />
                </div>
            </ScrollContainer>
        </div>

        <Transition name="fade">
            <Loader v-if="isLoading" />
        </Transition>
    </section>
</template>

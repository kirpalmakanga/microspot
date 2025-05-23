<script setup lang="ts">
const route = useRoute();
const {
    searchAll,
    searchArtists,
    searchAlbums,
    searchTracks,
    searchPlaylists,
    clearSearch
} = useSearchStore();

const isLoading = ref<boolean>(false);

const query = computed(() => (route.params.query as string) || '');
const tab = computed(() => (route.params.tab as string) || '');

async function loadTabData() {
    if (query.value && !isLoading.value) {
        isLoading.value = true;

        switch (tab.value) {
            case 'artists':
                await searchArtists(query.value);
                break;

            case 'albums':
                await searchAlbums(query.value);
                break;

            case 'tracks':
                await searchTracks(query.value);
                break;

            case 'playlists':
                await searchPlaylists(query.value);
                break;

            default:
                await searchAll(query.value);
                break;
        }

        isLoading.value = false;
    }
}

watch(
    query,
    () => {
        clearSearch();

        loadTabData();
    },
    { immediate: true }
);

watch(tab, loadTabData);

onUnmounted(clearSearch);

definePageMeta({
    key: 'search'
});

useAppTitle('Search');
</script>

<template>
    <section class="flex flex-col grow">
        <template v-if="query">
            <SearchTabs />

            <Transition name="fade" mode="out-in">
                <Loader v-if="isLoading" />

                <div v-else class="flex flex-col grow">
                    <SearchResults />
                </div>
            </Transition>
        </template>
    </section>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';

const route = useRoute();
const searchStore = useSearchStore();
const { query, isLoading } = storeToRefs(searchStore);
const {
    searchAll,
    searchArtists,
    searchAlbums,
    searchTracks,
    searchPlaylists,
    clearSearch,
    clearSearchResults
} = searchStore;

const tab = computed(() => route.params.tab || '');

const tabs = computed<{ title: string; href: string }[]>(() => {
    const basePath = `/search/${query.value}`;

    return [
        {
            title: 'All',
            href: basePath
        },
        {
            title: 'Artists',
            href: `${basePath}/artists`
        },
        {
            title: 'Albums',
            href: `${basePath}/albums`
        },
        {
            title: 'Tracks',
            href: `${basePath}/tracks`
        },
        {
            title: 'Playlists',
            href: `${basePath}/playlists`
        }
    ];
});

async function loadTabData() {
    if (query.value && !isLoading.value) {
        isLoading.value = true;

        switch (tab.value) {
            case 'artists':
                await searchArtists();
                break;

            case 'albums':
                await searchAlbums();
                break;

            case 'tracks':
                await searchTracks();
                break;

            case 'playlists':
                await searchPlaylists();
                break;

            default:
                await searchAll();
                break;
        }

        isLoading.value = false;
    }
}

const stopWatchingQuery = watchDebounced(
    query,
    () => {
        clearSearchResults();

        loadTabData();
    },
    { immediate: true, debounce: 500 }
);

const stopWatchingTab = watch(tab, loadTabData);

onBeforeMount(() => {
    const {
        params: { query: queryParam }
    } = route;

    if (queryParam) {
        query.value = queryParam as string;
    }
});

onUnmounted(() => {
    stopWatchingQuery();
    stopWatchingTab();

    clearSearch();
});
</script>

<template>
    <section class="flex flex-col grow">
        <ul v-if="query" class="flex gap-2 p-4">
            <li v-for="{ title, href } of tabs">
                <UButton
                    color="neutral"
                    :to="href"
                    :class="{
                        'opacity-50': href === route.fullPath
                    }"
                >
                    {{ title }}
                </UButton>
            </li>
        </ul>

        <Transition name="fade" mode="out-in">
            <Loader v-if="isLoading" />

            <div v-else class="flex flex-col grow">
                <NuxtPage />
            </div>
        </Transition>
    </section>
</template>

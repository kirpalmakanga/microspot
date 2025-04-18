<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';

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

const stopWatchingQuery = watchDebounced(
    query,
    () => {
        clearSearch();

        loadTabData();
    },
    { immediate: true, debounce: 500 }
);

const stopWatchingTab = watch(tab, loadTabData);

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

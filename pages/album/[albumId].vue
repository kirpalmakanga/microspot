<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { useDateFormat } from '@vueuse/core';

interface State {
    isLoading: boolean;
    isLoadingTracks: boolean;
    isMenuVisible: boolean;
}

const {
    params: { albumId }
} = useRoute();

const albumStore = useAlbumStore();
const {
    name,
    images,
    artists,
    itemCount,
    tracks,
    albumType,
    releaseDate,
    uri,
    isSaved,
    hasLoadedAllTracks
} = storeToRefs(albumStore);
const { getAlbum, getAlbumTracks, toggleSaveAlbum, clearAlbumData } =
    albumStore;

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const formattedReleaseDate = useDateFormat(releaseDate, 'YYYY');

const copy = useCopy();

const state = reactive<State>({
    isLoading: true,
    isLoadingTracks: false,
    isMenuVisible: false
});

const cover = computed(() => images.value.medium || images.value.large);

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/album/${albumId}`)
    }
];

async function loadUserData() {
    await getAlbum(albumId as string);

    state.isLoading = false;
}

async function loadTracks() {}

function openMenu() {
    state.isMenuVisible = true;
}

function closeMenu() {
    state.isMenuVisible = false;
}

useAppTitle(name);

onMounted(loadUserData);

onUnmounted(clearAlbumData);
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="state.isLoading" />

            <div v-else class="relative flex flex-col grow">
                <LayoutPageHeader
                    :type="albumType"
                    :cover="cover"
                    :title="name"
                >
                    <template #subtitles>
                        <p class="flex gap-1">
                            <template v-for="({ id, name }, index) of artists">
                                <span v-if="index > 0">,</span>

                                <span v-if="id === '0LyfQWJT6nXafLPZqxe9Of'">
                                    {{ name }}
                                </span>

                                <NuxtLink
                                    v-else
                                    class="opacity-80 hover:opacity-100 transition-opacity hover:underline"
                                    :to="`/artist/${id}`"
                                >
                                    {{ name }}
                                </NuxtLink>
                            </template>
                        </p>

                        <p class="opacity-60">
                            <span>
                                {{
                                    `${itemCount} track${
                                        itemCount === 1 ? '' : 's'
                                    }`
                                }}
                            </span>
                            |
                            <span>{{ formattedReleaseDate }}</span>
                        </p>
                    </template>
                </LayoutPageHeader>

                <div class="flex items-center gap-4 p-4">
                    <PlayButton
                        :is-playing="isCurrentContext(uri) && isPlaying"
                        @click="togglePlay({ contextUri: uri })"
                    />

                    <button
                        class="transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer"
                        @click="toggleSaveAlbum(albumId as string)"
                    >
                        <UIcon
                            class="size-8"
                            :name="
                                isSaved ? 'i-mi-crcle-check' : 'i-mi-circle-add'
                            "
                        />
                    </button>

                    <UDropdownMenu
                        class="w-48"
                        :items="menuOptions"
                        :content="{
                            align: 'start',
                            side: 'bottom'
                        }"
                    >
                        <button
                            class="hover:scale-110 hover:active:scale-90 transition-transform transform cursor-pointer"
                        >
                            <UIcon
                                class="size-8"
                                name="i-mi-options-horizontal"
                            />
                        </button>
                    </UDropdownMenu>
                </div>
                <ScrollContainer
                    class="bg-zinc-700"
                    @reached-bottom="
                        !state.isLoadingTracks &&
                            !hasLoadedAllTracks &&
                            getAlbumTracks()
                    "
                >
                    <Tracklist
                        type="album"
                        :context-uri="uri"
                        :items="tracks"
                    />
                </ScrollContainer>
            </div>
        </Transition>
    </section>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { useDateFormat } from '@vueuse/core';

interface State {
    isLoading: boolean;
    isPlaylistMenuOpen: boolean;
}

const {
    params: { trackId }
} = useRoute();

const trackStore = useTrackStore();
const { getTrack, clearTrackData, toggleSaveTrack } = trackStore;
const { images, name, albumId, albumName, artists, uri, releaseDate, isSaved } =
    storeToRefs(trackStore);

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const formattedReleaseDate = useDateFormat(releaseDate, 'YYYY');

const copy = useCopy();

const state = reactive<State>({
    isLoading: true,
    isPlaylistMenuOpen: false
});

const modalTitle = computed(
    () => `${artists.value.map(({ name }) => name).join(', ')} - ${name.value}`
);

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-add',
        label: 'Add to playlist',
        class: 'cursor-pointer',
        onSelect: () => openPlaylistMenu()
    },
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/track/${trackId}`)
    }
];

function openPlaylistMenu() {
    state.isPlaylistMenuOpen = true;
}

function closePLaylistMenu() {
    state.isPlaylistMenuOpen = false;
}

async function loadData() {
    await getTrack(trackId as string);

    state.isLoading = false;
}

useAppTitle(name);

onMounted(loadData);

onUnmounted(clearTrackData);
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="state.isLoading" />

            <div v-else class="relative flex flex-col grow">
                <LayoutPageHeader
                    type="Track"
                    :cover="images.medium || images.large"
                    :title="name"
                >
                    <template #subtitles>
                        <p class="flex gap-1">
                            <span>
                                <template
                                    v-for="({ id, name }, index) of artists"
                                >
                                    <span v-if="index > 0">{{ ', ' }}</span>

                                    <NuxtLink
                                        class="opacity-80 hover:opacity-100 transition-opacity hover:underline"
                                        :to="`/artist/${id}`"
                                    >
                                        {{ name }}
                                    </NuxtLink>
                                </template>
                            </span>

                            <span>•</span>

                            <NuxtLink
                                class="opacity-80 hover:opacity-100 transition-opacity hover:underline"
                                :to="`/album/${albumId}`"
                            >
                                {{ albumName }}
                            </NuxtLink>

                            <span>•</span>

                            <span>{{ formattedReleaseDate }}</span>
                        </p>
                    </template>
                </LayoutPageHeader>

                <div class="flex items-center gap-4 p-4">
                    <PlayButton
                        :is-playing="isCurrentContext('', uri) && isPlaying"
                        @click="togglePlay({ contextUri: '', trackUri: uri })"
                    />

                    <button
                        class="transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer"
                        @click="toggleSaveTrack(trackId as string)"
                    >
                        <UIcon
                            class="size-8"
                            :name="
                                isSaved
                                    ? 'i-mi-circle-check'
                                    : 'i-mi-circle-check'
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
            </div>
        </Transition>

        <PlaylistMenu
            v-model:is-open="state.isPlaylistMenuOpen"
            :track-id="(trackId as string)"
            :title="modalTitle"
            @close="closePLaylistMenu"
        />
    </section>
</template>

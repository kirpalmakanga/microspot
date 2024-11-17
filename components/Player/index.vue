<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { useFullscreen } from '@vueuse/core';

const playerStore = usePlayerStore();
const { context } = storeToRefs(playerStore);

const playerWrapper = useTemplateRef('playerWrapper');

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(playerWrapper);

const {
    isPlaying,
    isReady,
    cannotSkipToPrevious,
    cannotSkipToNext,
    currentTrack,
    currentTrackPosition,
    availableDevices,
    init,
    destroy,
    play,
    pause,
    seek,
    goToPreviousTrack,
    goToNextTrack,
    setCurrentTrack,
    getDevices,
    setActiveDevice,
    toggleSaveCurrentTrack
} = useSpotifyPlayer();

const isDeviceSelectorVisible = ref<boolean>(false);

const contextUri = computed(() => {
    const {
        value: { uri }
    } = context;

    return uri ? uri.replace('spotify', '').replaceAll(':', '/') : '';
});

const formattedPosition = computed(() =>
    formatTime(currentTrackPosition.value / 1000)
);

const formattedDuration = computed(() =>
    formatTime(currentTrack.value.duration / 1000)
);

function togglePlay() {
    isPlaying.value ? pause() : play();
}

async function openDeviceSelector() {
    await getDevices();

    isDeviceSelectorVisible.value = true;
}

onMounted(async () => {
    await init();

    emitter.on('launch', setCurrentTrack);
    emitter.on('togglePlay', togglePlay);
});

onBeforeUnmount(destroy);
</script>

<template>
    <div ref="playerWrapper" class="relative flex flex-col">
        <PlayerFullscreenOverlay
            v-if="isFullscreen"
            class="grow flex justify-center items-center bg-zinc-800"
            :cover="currentTrack.images.large"
            :title="currentTrack.name"
            :artists="currentTrack.artists"
            @click="togglePlay"
        />

        <div class="relative flex h-20 shadow">
            <div class="flex">
                <PlayerControl
                    icon="i-mi-chevron-left"
                    :disabled="cannotSkipToPrevious || !isReady"
                    @click="goToPreviousTrack"
                />

                <PlayerControl
                    :icon="isPlaying && isReady ? 'i-mi-pause' : 'i-mi-play'"
                    :disabled="!currentTrack.id || !isReady"
                    @click="togglePlay"
                />

                <PlayerControl
                    icon="i-mi-chevron-right"
                    :disabled="cannotSkipToNext || !isReady"
                    @click="goToNextTrack"
                />
            </div>

            <div class="flex grow overflow-hidden bg-zinc-700">
                <Img
                    v-if="currentTrack.id"
                    class="bg-zinc-400 flex-shrink-0 inline-flex w-16 h-16 rounded-md ml-2 my-2"
                    :src="currentTrack.images.small"
                />

                <div class="flex flex-col grow p-2">
                    <div
                        v-if="currentTrack.id"
                        class="flex gap-2 overflow-hidden"
                    >
                        <Ellipsis class="flex flex-col grow">
                            <NuxtLink
                                v-if="currentTrack.name && contextUri"
                                class="text-md no-underline hover:underline"
                                :to="contextUri"
                            >
                                {{ currentTrack.name }}
                            </NuxtLink>

                            <Artists
                                v-if="currentTrack.artists.length"
                                class="text-sm"
                                :items="currentTrack.artists"
                            />
                        </Ellipsis>

                        <button
                            class="transform transition-transform hover:scale-110 hover:active:scale-90"
                            @click="toggleSaveCurrentTrack"
                        >
                            <UIcon
                                class="h-6 w-6"
                                :name="
                                    currentTrack.isSaved
                                        ? 'i-mi-circle-check'
                                        : 'i-mi-circle-add'
                                "
                            />
                        </button>
                    </div>

                    <div
                        class="flex grow gap-1 items-center justify-center overflow-hidden"
                    >
                        <div class="text-sm">
                            {{ formattedPosition }}
                        </div>

                        <PlayerSeekbar
                            :position="currentTrackPosition"
                            :duration="currentTrack.duration"
                            @update="seek"
                        />

                        <span class="text-sm">
                            {{ formattedDuration }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex">
                <PlayerControl
                    icon="i-mi-speakers"
                    @click="openDeviceSelector"
                />

                <PlayerControl
                    :icon="isFullscreen ? 'i-mi-minimize' : 'i-mi-expand'"
                    @click="toggleFullscreen"
                />
            </div>
        </div>
    </div>

    <USlideover
        v-model:open="isDeviceSelectorVisible"
        title="Connect to a device"
        :close="{
            color: 'primary',
            variant: 'soft',
            class: 'cursor-pointer'
        }"
    >
        <template #body>
            <PlayerDeviceSelector :items="availableDevices" />
        </template>
    </USlideover>
</template>

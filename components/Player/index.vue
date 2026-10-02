<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';

const playerStore = usePlayerStore();

const {
    init,
    destroy,
    togglePlay,
    seek,
    goToPreviousTrack,
    goToNextTrack,
    toggleSaveCurrentTrack
} = playerStore;

const {
    isPlaying,
    isReady,
    cannotSkipToPrevious,
    cannotSkipToNext,
    contextUri,
    track,
    trackPosition
} = storeToRefs(playerStore);

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(useTemplateRef('playerWrapper'));

const contextHref = computed(() => {
    const uri = contextUri.value || track.value.uri;

    return uri ? uri.replace('spotify', '').replaceAll(':', '/') : '';
});

const formattedPosition = computed(() => formatTime(trackPosition.value / 1000));

const formattedDuration = computed(() => formatTime(track.value.duration / 1000));

onMounted(init);

onBeforeUnmount(destroy);
</script>

<template>
    <div ref="playerWrapper" class="relative flex flex-col">
        <PlayerFullscreenOverlay
            v-if="isFullscreen"
            class="grow flex justify-center items-center bg-zinc-800"
            :cover="track.images.large"
            :title="track.name"
            :artists="track.artists"
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
                    :disabled="!track.id || !isReady"
                    @click="togglePlay"
                />

                <PlayerControl
                    icon="i-mi-chevron-right"
                    :disabled="cannotSkipToNext || !isReady"
                    @click="goToNextTrack"
                />
            </div>

            <div class="flex grow bg-zinc-700">
                <PlayerTrackMenu :track-data="track">
                    <Img
                        v-if="track.id"
                        class="bg-zinc-400 flex-shrink-0 inline-flex w-16 h-16 rounded-md ml-2 my-2"
                        :src="track.images.small"
                    />
                </PlayerTrackMenu>

                <div class="flex flex-col grow p-2">
                    <div v-if="track.id" class="flex gap-2 overflow-hidden">
                        <div class="flex flex-col grow overflow-hidden">
                            <PlayerTrackMenu :track-data="track">
                                <NuxtLink
                                    v-if="track.name && contextHref"
                                    class="inline-block text-md truncate no-underline hover:underline"
                                    :to="contextHref"
                                >
                                    {{ track.name }}
                                </NuxtLink>
                            </PlayerTrackMenu>

                            <Artists
                                v-if="track.artists.length"
                                class="inline-block text-sm truncate"
                                :items="track.artists"
                            />
                        </div>

                        <button
                            class="flex items-center transform transition-transform hover:scale-110 hover:active:scale-90"
                            @click="toggleSaveCurrentTrack"
                        >
                            <UIcon
                                class="h-6 w-6"
                                :name="track.isSaved ? 'i-mi-circle-check' : 'i-mi-circle-add'"
                            />
                        </button>
                    </div>

                    <div class="flex grow gap-1 items-center justify-center overflow-hidden">
                        <div class="text-sm">
                            {{ formattedPosition }}
                        </div>

                        <PlayerSeekbar
                            :position="trackPosition"
                            :duration="track.duration"
                            @update="seek"
                        />

                        <span class="text-sm">
                            {{ formattedDuration }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex">
                <PlayerDeviceSelector>
                    <PlayerControl icon="i-mi-speakers" />
                </PlayerDeviceSelector>

                <PlayerControl
                    :icon="isFullscreen ? 'i-mi-minimize' : 'i-mi-expand'"
                    @click="toggleFullscreen"
                />
            </div>
        </div>
    </div>
</template>

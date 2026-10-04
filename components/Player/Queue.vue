<script setup lang="ts">
const playerStore = usePlayerStore();
const { toggleContextPlay, isCurrentContext } = playerStore;
const { contextUri, track, isPlaying } = storeToRefs(playerStore);

const { data: queue, error, isPending, isLoading, refetch } = useQueue();

const { mutate: toggleSaveTrack } = useToggleSaveQueueTrack();

const isOpen = defineModel<boolean>('open', { default: false });

watch(track, () => refetch());

watch(isOpen, () => {
    if (isOpen.value) {
        refetch();
    }
});

watch(error, () => {
    if (error.value) {
        console.error(error.value);
    }
});
</script>

<template>
    <USlideover
        v-model:open="isOpen"
        title="Queue"
        :close="{
            color: 'primary',
            variant: 'soft',
            class: 'cursor-pointer'
        }"
        :ui="{ body: 'flex flex-col overflow-hidden' }"
    >
        <slot />

        <template #body>
            <p class="mb-2">Now playing</p>

            <div v-if="track" class="mb-8">
                <TracklistItem
                    v-if="track"
                    v-bind="track"
                    :list-type="'queue'"
                    :is-playing="isCurrentContext(contextUri, track.uri) && isPlaying"
                    :is-playable="true"
                    :is-current="false"
                    @save="toggleSaveTrack(track.id)"
                    @toggle-play="toggleContextPlay(contextUri, track.uri)"
                />
            </div>

            <div v-if="isPending || (error && isLoading)">
                <USkeleton class="h-6 mb-2" />

                <div class="bg-zinc-700 flex h-14 gap-2 rounded-md p-4 items-center">
                    <USkeleton class="size-6" />

                    <USkeleton class="h-6 grow" />
                </div>
            </div>

            <Error v-else-if="error" @action="refetch()" />

            <template v-if="queue">
                <p class="mb-2">Next</p>

                <ScrollContainer>
                    <Tracklist
                        v-if="queue"
                        :context-uri="contextUri"
                        type="queue"
                        :items="queue"
                        @toggle-save-track="toggleSaveTrack"
                    />
                </ScrollContainer>
            </template>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { useDateFormat } from '@vueuse/core';
import MenuButton from '~/components/global/MenuButton.vue';

const {
    params: { trackId }
} = useRoute();

const { data: track, isPending, isLoading, error, refetch } = useTrack(trackId as string);

const { mutate: toggleSaveTrack } = useToggleSaveTrack(trackId as string);

const playerStore = usePlayerStore();
const { isCurrentContext, togglePlay } = playerStore;
const { isPlaying } = storeToRefs(playerStore);

const formattedReleaseDate = useDateFormat(
    computed(() => track.value?.releaseDate),
    'YYYY'
);

const copy = useCopy();

const isPlaylistMenuOpen = ref<boolean>(false);

const playlistMenuTitle = computed(() => {
    if (track.value) {
        return `${track.value.artists.map(({ name }) => name).join(', ')} - ${track.value.name}`;
    }

    return '';
});

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-add',
        label: 'Add to playlist',
        class: 'cursor-pointer',
        onSelect: () => (isPlaylistMenuOpen.value = true)
    },
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/track/${trackId}`)
    }
];

useAppTitle(computed(() => track.value?.name));
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="isPending || (error && isLoading)" />

            <Error v-else-if="error" @action="refetch()" />

            <div v-else-if="track" class="relative flex flex-col grow">
                <LayoutPageHeader
                    type="Track"
                    :cover="track.images.medium || track.images.large"
                    :title="track.name"
                >
                    <template #subtitles>
                        <p class="flex gap-1">
                            <span>
                                <template v-for="({ id, name }, index) of track.artists" :key="id">
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
                                :to="`/album/${track.albumId}`"
                            >
                                {{ track.albumName }}
                            </NuxtLink>

                            <span>•</span>

                            <span>{{ formattedReleaseDate }}</span>
                        </p>
                    </template>
                </LayoutPageHeader>

                <div class="flex items-center gap-4 p-4">
                    <PlayButton
                        :is-playing="isCurrentContext('', track.uri) && isPlaying"
                        @click="togglePlay({ contextUri: '', trackUri: track.uri })"
                    />

                    <button
                        class="transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer"
                        @click="toggleSaveTrack(trackId as string)"
                    >
                        <UIcon
                            class="size-8"
                            :name="track.isSaved ? 'i-mi-circle-check' : 'i-mi-circle-add'"
                        />
                    </button>

                    <MenuButton :menu-options="menuOptions" />
                </div>
            </div>
        </Transition>

        <UModal v-model:open="isPlaylistMenuOpen" :title="playlistMenuTitle">
            <template #body>
                <PlaylistMenu
                    :track-id="trackId as string"
                    :title="playlistMenuTitle"
                    @saved="isPlaylistMenuOpen = false"
                />
            </template>
        </UModal>
    </section>
</template>

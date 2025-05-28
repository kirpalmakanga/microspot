<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const props = withDefaults(
    defineProps<{
        index: number;
        id: string;
        name: string;
        images?: Images;
        albumId?: string;
        albumName?: string;
        trackNumber?: number;
        artists: Artist[];
        duration: number;
        isCurrent: boolean;
        isPlaying: boolean;
        isPlayable: boolean;
        isSaved: boolean;
        isPlaylistItem: boolean;
    }>(),
    {
        isPlayable: true
    }
);

const emit = defineEmits<{
    togglePlay: [e: void];
    save: [e: void];
    delete: [e: void];
}>();

const copy = useCopy();

const isPlaylistMenuOpen = ref<boolean>(false);

const playlistMenuTitle = computed(() => {
    const { name, artists } = props;

    return `${artists.map(({ name }) => name).join(', ')} - ${name}`;
});

const menuConfig = {
    align: 'end',
    side: 'bottom'
} as const;

const menuOptions = computed<ContextMenuItem[]>(() => [
    {
        icon: 'i-mi-add',
        label: 'Add to playlist',
        onSelect: () => (isPlaylistMenuOpen.value = true)
    },
    {
        icon: props.isSaved ? 'i-mi-circle-check' : 'i-mi-circle-add',
        label: props.isSaved
            ? 'Remove from liked tracks'
            : 'Save to liked tracks',
        onSelect: () => emit('save')
    },
    {
        icon: 'i-mi-share',
        label: 'Share',
        onSelect: () => copy(`${window.location.origin}/track/${props.id}`)
    },
    ...(props.isPlaylistItem
        ? [
              {
                  icon: 'i-mi-delete',
                  label: 'Remove from this playlist',
                  onSelect: () => emit('delete')
              }
          ]
        : [])
]);
</script>

<template>
    <UContextMenu :items="menuOptions">
        <article
            class="flex items-center hover:bg-indigo-400 transition-colors not-last:border-b-1 border-primary-700 overflow-hidden group"
            :class="{
                'bg-indigo-500': isCurrent,
                'bg-zinc-600': !isCurrent,
                'opacity-50': !isPlayable
            }"
        >
            <button
                class="flex items-center justify-center size-10 p-2 hover:opacity-80 cursor-pointer"
                @click="emit('togglePlay')"
            >
                <UIcon
                    v-if="isCurrent && isPlaying"
                    class="group-hover:hidden size-5"
                    name="i-mi-volume-up"
                />

                <span v-else class="group-hover:hidden size-6">
                    {{ isPlaylistItem ? index : trackNumber }}
                </span>

                <UIcon
                    class="hidden group-hover:block size-6"
                    :name="isPlaying ? 'i-mi-pause' : 'i-mi-play'"
                />
            </button>

            <Img
                v-if="images"
                class="bg-zinc-700 size-12 flex-shrink-0"
                :src="images.small"
            />

            <div class="grow overflow-hidden p-2">
                <Ellipsis has-tooltip>
                    <NuxtLink class="hover:underline" :to="`/track/${id}`">
                        {{ name }}
                    </NuxtLink>
                </Ellipsis>

                <Ellipsis class="text-sm" has-tooltip>
                    <Artists :items="artists" />

                    <template v-if="albumName">
                        <span>{{ ' - ' }}</span>

                        <NuxtLink
                            class="hover:underline"
                            :to="`/album/${albumId}`"
                        >
                            {{ albumName }}
                        </NuxtLink>
                    </template>
                </Ellipsis>
            </div>

            <button
                class="flex items-center justify-center p-2 transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                @click="emit('save')"
            >
                <UIcon
                    class="size-6"
                    :name="isSaved ? 'i-mi-circle-check' : 'i-mi-circle-add'"
                />
            </button>

            <div class="text-sm">{{ formatTime(duration / 1000) }}</div>

            <UDropdownMenu :items="menuOptions" :content="menuConfig">
                <button
                    class="flex items-center justify-center p-2 transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <UIcon class="size-6" name="i-mi-options-horizontal" />
                </button>
            </UDropdownMenu>
        </article>

        <UModal v-model:open="isPlaylistMenuOpen" :title="playlistMenuTitle">
            <template #body>
                <PlaylistMenu
                    :track-id="id"
                    @saved="isPlaylistMenuOpen = false"
                />
            </template>
        </UModal>
    </UContextMenu>
</template>

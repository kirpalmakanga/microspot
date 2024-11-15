<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

interface State {
    isLoading: boolean;
    isLoadingAlbums: boolean;
    isMenuVisible: boolean;
}

const {
    params: { artistId }
} = useRoute();

const copy = useCopy();

const artistStore = useArtistStore();
const { name, images, albumCount, albums, hasLoadedAllAlbums } =
    storeToRefs(artistStore);
const { getArtist, getArtistAlbums } = artistStore;

const state = reactive<State>({
    isLoading: true,
    isLoadingAlbums: false,
    isMenuVisible: false
});

const cover = computed(() => images.value.medium || images.value.large);

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-share',
        label: 'Share',
        class: 'cursor-pointer',
        onSelect: () => copy(`${window.location.origin}/artist/${artistId}`)
    }
];

async function loadData() {
    await getArtist(artistId as string);

    state.isLoading = false;
}

function openMenu() {
    state.isMenuVisible = true;
}

function closeMenu() {
    state.isMenuVisible = false;
}

useAppTitle(name);

onMounted(loadData);
</script>

<template>
    <section class="flex flex-col grow">
        <Transition name="fade" mode="out-in">
            <Loader v-if="state.isLoading" />

            <div v-else class="relative flex flex-col grow">
                <LayoutPageHeader type="Artist" :cover="cover" :title="name">
                    <template #subtitles>
                        <p class="text-sm opacity-60">
                            {{
                                `${albumCount} album${
                                    albumCount === 1 ? '' : 's'
                                }`
                            }}
                        </p>
                    </template>
                </LayoutPageHeader>

                <div class="flex items-center gap-4 p-4">
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
                    scrollable-class="p-4"
                    @reached-bottom="
                        !state.isLoadingAlbums &&
                            !hasLoadedAllAlbums &&
                            getArtistAlbums()
                    "
                >
                    <AlbumGrid :items="albums" />
                </ScrollContainer>
            </div>
        </Transition>
    </section>
</template>

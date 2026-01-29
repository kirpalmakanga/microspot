<script setup lang="ts">
const route = useRoute();
const searchStore = useSearchStore();
const { artists, albums, tracks, playlists } = storeToRefs(searchStore);
const { searchArtists, searchAlbums, searchTracks, searchPlaylists, toggleSaveTrack } = searchStore;

const query = computed(() => (route.params.query as string) || '');
const tab = computed(() => (route.params.tab as string) || '');

const selectedTracks = computed(() => tracks.value.slice(0, 6));
const selectedArtists = computed(() => artists.value.slice(0, 6));
const selectedAlbums = computed(() => albums.value.slice(0, 6));
const selectedPLaylists = computed(() => playlists.value.slice(0, 6));
</script>

<template>
    <template v-if="!tab">
        <ScrollContainer
            v-if="tracks.length || artists.length || albums.length || playlists.length"
        >
            <div class="p-4">
                <h2 class="mb-4 font-bold font-secondary">Tracks</h2>

                <Tracklist
                    :context-uri="''"
                    type="search"
                    :items="selectedTracks"
                    @toggle-save-track="toggleSaveTrack"
                />
            </div>

            <div class="p-4 mt-4">
                <h2 class="mb-4 font-bold font-secondary">Artists</h2>

                <ArtistGrid :items="selectedArtists" />
            </div>

            <div class="p-4 mt-4">
                <h2 class="mb-4 font-bold font-secondary">Albums</h2>

                <AlbumGrid :items="selectedAlbums" />
            </div>

            <div class="p-4 mt-4">
                <h2 class="mb-4 font-bold font-secondary">Playlists</h2>

                <PlaylistGrid :items="selectedPLaylists" />
            </div>
        </ScrollContainer>
    </template>

    <ScrollContainer v-else-if="tab === 'artists'" @reached-bottom="searchArtists(query)">
        <ArtistGrid class="p-4" :items="artists" />
    </ScrollContainer>

    <ScrollContainer v-else-if="tab === 'albums'" @reached-bottom="searchAlbums(query)">
        <AlbumGrid class="p-4" :items="albums" />
    </ScrollContainer>

    <TracklistVirtualized
        v-else-if="tab === 'tracks'"
        :context-uri="''"
        type="search"
        :items="tracks"
        @toggle-save-track="toggleSaveTrack"
        @reached-bottom="searchTracks(query)"
    />

    <ScrollContainer v-else-if="tab === 'playlists'" @reached-bottom="searchPlaylists(query)">
        <PlaylistGrid class="p-4" :items="playlists" />
    </ScrollContainer>
</template>

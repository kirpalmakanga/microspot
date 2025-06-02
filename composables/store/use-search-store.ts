import {
    searchAlbums,
    searchAll,
    searchArtists,
    searchPlaylists,
    searchTracks,
    toggleSaveTrack
} from '~/services/spotify-api';

interface State {
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
    tracks: Track[];
}

const getDefaultState = (): State => ({
    artists: [],
    albums: [],
    playlists: [],
    tracks: []
});

export const useSearchStore = defineStore('search', () => {
    const state = reactive<State>(getDefaultState());

    return {
        ...toRefs(state),
        clearSearch() {
            Object.assign(state, getDefaultState());
        },
        async searchAll(query: string) {
            Object.assign(state, await searchAll(query));
        },
        async searchArtists(query: string) {
            const { artists } = state;

            artists.push(...(await searchArtists(query, artists.length)));
        },
        async searchTracks(query: string) {
            const { tracks } = state;

            tracks.push(...(await searchTracks(query, tracks.length)));
        },
        async searchAlbums(query: string) {
            const { albums } = state;

            albums.push(...(await searchAlbums(query, albums.length)));
        },
        async searchPlaylists(query: string) {
            const { playlists } = state;

            playlists.push(...(await searchPlaylists(query, playlists.length)));
        },
        async toggleSaveTrack(trackId: string) {
            const isSaved = await toggleSaveTrack(trackId);

            state.tracks = update(state.tracks, ({ id }) => id === trackId, {
                isSaved
            });
        }
    };
});

interface State {
    query: string;
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
    tracks: Track[];
    isLoading: boolean;
}

const getDefaultState = (): State => ({
    query: '',
    artists: [],
    albums: [],
    playlists: [],
    tracks: [],
    isLoading: false
});

export const useSearchStore = defineStore('search', () => {
    const {
        searchAll,
        searchArtists,
        searchTracks,
        searchAlbums,
        searchPlaylists
    } = useSpotifyApi();

    const state = reactive<State>(getDefaultState());

    return {
        ...toRefs(state),
        clearSearch() {
            Object.assign(state, getDefaultState());
        },
        clearSearchResults() {
            Object.assign(state, omit(getDefaultState(), 'query'));
        },
        async searchAll() {
            Object.assign(state, await searchAll(state.query));
        },
        async searchArtists() {
            const { query, artists } = state;

            artists.push(...(await searchArtists(query, artists.length)));
        },
        async searchTracks() {
            const { query, tracks } = state;

            tracks.push(...(await searchTracks(query, tracks.length)));
        },
        async searchAlbums() {
            const { query, albums } = state;

            albums.push(...(await searchAlbums(query, albums.length)));
        },
        async searchPlaylists() {
            const { query, playlists } = state;

            playlists.push(...(await searchPlaylists(query, playlists.length)));
        }
    };
});

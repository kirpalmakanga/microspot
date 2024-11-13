interface State extends Album {
    tracks: Track[];
}

const getDefaultState = (): State => ({
    id: '',
    name: '',
    images: { small: '', medium: '', large: '' },
    artists: [],
    tracks: [],
    itemCount: 0,
    releaseDate: '',
    albumType: '',
    uri: '',
    isSaved: false
});

export const useAlbumStore = defineStore('album', () => {
    const {
        isAlbumSaved,
        getAlbum,
        getAlbumTracks,
        toggleSaveTrack,
        toggleSaveAlbum
    } = useSpotifyApi();
    const state = reactive<State>(getDefaultState());

    return {
        ...toRefs(state),
        hasLoadedAllTracks: computed(() => {
            const { itemCount, tracks } = state;

            return itemCount > 0 && tracks.length === itemCount;
        }),
        async getAlbum(albumId: string) {
            const [albumData, tracks, isSaved] = await Promise.all([
                getAlbum(albumId),
                getAlbumTracks(albumId),
                isAlbumSaved(albumId)
            ]);

            Object.assign(state, albumData, {
                tracks,
                isSaved
            });
        },
        async getAlbumTracks() {
            const { tracks: currentTracks } = state;
            const tracks = await getAlbumTracks(state.id, currentTracks.length);

            state.tracks = [...currentTracks, ...tracks];
        },
        async toggleSaveAlbum(trackId: string) {
            state.isSaved = await toggleSaveAlbum(trackId);
        },
        async toggleSaveAlbumTrack(trackId: string) {
            const { tracks } = state;
            const isSaved = await toggleSaveTrack(trackId);

            const index = state.tracks.findIndex(({ id }) => id === trackId);

            if (index > -1) {
                tracks[index] = { ...tracks[index], isSaved };
            }
        },
        clearAlbumData() {
            Object.assign(state, getDefaultState());
        }
    };
});

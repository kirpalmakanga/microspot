interface State extends PlaylistTrack {
    isSaved: boolean;
}

const getDefaultState = (): State => ({
    id: '',
    uri: '',
    name: '',
    albumId: '',
    albumName: '',
    releaseDate: '',
    images: {
        small: '',
        medium: '',
        large: ''
    },
    artists: [],
    duration: 0,
    type: '',
    isAvailable: true,
    isSaved: false
});

export const useTrackStore = defineStore('track', () => {
    const state = reactive<State>(getDefaultState());
    const { isTrackSaved, toggleSaveTrack, getTrack } = useSpotifyApi();

    return {
        ...toRefs(state),
        async getTrack(trackId: string) {
            const [trackData, isSaved] = await Promise.all([
                getTrack(trackId),
                isTrackSaved(trackId)
            ]);

            Object.assign(state, trackData, {
                isSaved
            });
        },
        async toggleSaveTrack(trackId: string) {
            state.isSaved = await toggleSaveTrack(trackId);
        },
        clearTrackData() {
            Object.assign(state, getDefaultState());
        }
    };
});

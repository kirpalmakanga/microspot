interface State extends Playlist {
    tracks: PlaylistTrack[];
    isSaved: boolean;
}

const getDefaultState = (): State => ({
    id: '',
    uri: '',
    userId: '',
    userName: '',
    images: { small: '', medium: '', large: '' },
    name: '',
    description: '',
    tracks: [],
    isFollowed: false,
    totalItemCount: 0,
    isSaved: false
});

export const usePlaylistStore = defineStore('playlist', () => {
    const {
        getSavedTracks,
        getPlaylist,
        updatePlaylist,
        updatePlaylistCover,
        getPlaylistTracks,
        toggleSaveTrack,
        removePlaylistTrack
    } = useSpotifyApi();
    const state = reactive<State>(getDefaultState());

    return {
        ...toRefs(state),
        hasLoadedAllTracks: computed(() => {
            const { totalItemCount, tracks } = state;

            return totalItemCount > 0 && tracks.length === totalItemCount;
        }),
        async getSavedTracks() {
            const { tracks: currentTracks } = state;
            const tracks = await getSavedTracks(state.tracks.length);

            state.tracks = [...currentTracks, ...tracks];
        },
        async getPlaylist(playlistId: string) {
            const [data, tracks] = await Promise.all([
                getPlaylist(playlistId),
                getPlaylistTracks(playlistId)
            ]);

            Object.assign(state, data, { tracks });
        },
        async updatePlaylist(
            data: { name: string; description: string },
            cover?: string
        ) {
            if (data) {
                updatePlaylist(state.id, data);

                Object.assign(state, data);
            }

            if (cover && cover.startsWith('data:image')) {
                const encodedFile = cover.split(',').pop();

                encodedFile && updatePlaylistCover(state.id, encodedFile);

                state.images.large = cover;
            }
        },
        async getPlaylistTracks(playlistId: string) {
            const { tracks: currentTracks } = state;
            const tracks = await getPlaylistTracks(
                playlistId,
                currentTracks.length
            );

            state.tracks = [...currentTracks, ...tracks];
        },
        async toggleSavePlaylistTrack(trackId: string) {
            const { tracks } = state;
            const isSaved = await toggleSaveTrack(trackId);

            const index = state.tracks.findIndex(({ id }) => id === trackId);

            if (index > -1) {
                tracks[index] = { ...tracks[index], isSaved };
            }
        },
        async removePlaylistTrack(trackId: string) {
            await removePlaylistTrack(state.id, trackId);

            state.tracks = state.tracks.filter(({ id }) => id !== trackId);
        },
        clearPlaylistData() {
            Object.assign(state, getDefaultState());
        }
    };
});

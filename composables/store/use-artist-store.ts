interface State extends Artist {
    albums: Album[];
    albumCount: number;
}

const getDefaultState = (): State => ({
    id: '',
    name: '',
    images: { small: '', medium: '', large: '' },
    uri: '',
    albums: [],
    albumCount: 0
});

export const useArtistStore = defineStore('artist', () => {
    const { getArtist, getArtistAlbums } = useSpotifyApi();
    const state = reactive<State>(getDefaultState());

    return {
        ...toRefs(state),
        hasLoadedAllAlbums: computed(
            () => state.albums.length === state.albumCount
        ),
        async getArtist(artistId: string) {
            const [artistData, artistAlbumData] = await Promise.all([
                getArtist(artistId),
                getArtistAlbums(artistId)
            ]);

            Object.assign(state, artistData, artistAlbumData);
        },
        async getArtistAlbums() {
            const { id, albums: currentAlbums } = state;
            const { albums } = await getArtistAlbums(id, currentAlbums.length);

            state.albums = [...currentAlbums, ...albums];
        }
    };
});

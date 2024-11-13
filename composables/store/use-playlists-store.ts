interface State {
    items: Playlist[];
    totalItemCount: number;
}

const getDefaultState = (): State => ({
    items: [],
    totalItemCount: 0
});

export const usePlaylistsStore = defineStore('playlists', () => {
    const { getPlaylist, getUserPlaylists, createPlaylist, addPlaylistTrack } =
        useSpotifyApi();
    const authStore = useAuthStore();
    const userStore = useUserStore();

    const state = reactive<State>(getDefaultState());

    const currentUserPlaylists = computed(() =>
        state.items.filter(
            ({ userId, isFollowed }) =>
                userId === authStore.userId || isFollowed
        )
    );

    const userPlaylists = computed(() =>
        uniqueByKey(state.items, 'id').filter(
            ({ userId }) => userId === userStore.id
        )
    );

    const hasLoadedAllPlaylists = computed(() => {
        const { totalItemCount, items } = state;

        return totalItemCount > 0 && items.length === totalItemCount;
    });

    return {
        ...toRefs(state),
        userPlaylists,
        currentUserPlaylists,
        hasLoadedAllPlaylists,
        async getCurrentUserPlaylists() {
            const { items, totalItemCount } = await getUserPlaylists(
                undefined,
                currentUserPlaylists.value.length
            );

            Object.assign(state, {
                items: [...state.items, ...items],
                totalItemCount
            });
        },
        async getUserPlaylists(userId: string) {
            const { items, totalItemCount } = await getUserPlaylists(
                userId,
                userPlaylists.value.length
            );

            Object.assign(state, {
                items: [...state.items, ...items],
                totalItemCount
            });
        },
        async createPlaylist(name: string) {
            const playlist = await createPlaylist(authStore.userId, name);

            Object.assign(state, { items: [...state.items, playlist] });

            return playlist.id;
        },
        async addPlaylistTrack(playlistId: string, trackId: string) {
            const items = [...state.items];

            const index = items.findIndex(({ id }) => id === playlistId);

            if (index > -1) {
                await addPlaylistTrack(playlistId, trackId);

                items[index] = await getPlaylist(playlistId);

                Object.assign({ items });
            }
        },
        clearPlaylists(targetUserId: string) {
            state.items = state.items.filter(
                ({ userId, isFollowed }) =>
                    userId !== targetUserId && !isFollowed
            );
        }
    };
});

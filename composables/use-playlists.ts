import {
    addPlaylistTrack,
    createPlaylist,
    getPlaylist,
    getPlaylistTracks,
    getUserPlaylists,
    removePlaylistTrack,
    toggleSaveTrack,
    updatePlaylist,
    updatePlaylistCover
} from '~/services/spotify-api';

export function useUserPlaylists(userId: MaybeRef<string>) {
    return useInfiniteQuery({
        key: () => ['playlists', toValue(userId)],
        query: ({ pageParam: offset }) => getUserPlaylists(toValue(userId), offset),
        initialPageParam: 0,
        getNextPageParam: ({ totalItemCount }, pages) => {
            const currentItemCount = pages.reduce((count, { items }) => count + items.length, 0);

            return currentItemCount < totalItemCount ? currentItemCount : null;
        }
    });
}

export function usePlaylist(playlistId: MaybeRef<string>) {
    return useQuery({
        key: () => ['playlist', toValue(playlistId)],
        query: () => getPlaylist(toValue(playlistId))
    });
}

export function useUpdatePlaylist(playlistId: MaybeRef<string>) {
    const queryCache = useQueryCache();
    const authStore = useAuthStore();

    return useMutation({
        mutation: async ({
            cover,
            ...playlistData
        }: {
            name: string;
            description: string;
            cover?: string;
        }) => {
            await updatePlaylist(toValue(playlistId), playlistData);

            if (cover && cover.startsWith('data:image')) {
                await updatePlaylistCover(toValue(playlistId), cover);
            }
        },
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['playlist', playlistId]
            });

            queryCache.invalidateQueries({
                key: ['playlists', authStore.userId]
            });
        }
    });
}

export function usePlaylistTracks(playlistId: MaybeRef<string>) {
    const { data: playlist } = usePlaylist(playlistId);

    /** TODO: load saved tracks (playlistId === 'saved') */

    return useInfiniteQuery({
        key: () => ['playlistTracks', toValue(playlistId)],
        query: ({ pageParam: offset }) => getPlaylistTracks(toValue(playlistId), offset),
        initialPageParam: 0,
        getNextPageParam: (_, pages) => {
            const { totalItemCount } = playlist?.value || {};

            if (!totalItemCount) {
                return 0;
            }

            const currentItemCount = pages.flat().length;

            return currentItemCount < totalItemCount ? currentItemCount : null;
        }
    });
}

export function useToggleSavePlaylistTrack(playlistId: MaybeRef<string>) {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: (trackId: string) => toggleSaveTrack(trackId),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['playlistTracks', playlistId]
            });
        }
    });
}

export function useAddPlaylistTrack() {
    const router = useRouter();
    const queryCache = useQueryCache();
    const authStore = useAuthStore();

    return useMutation({
        mutation: async ({ playlistId, trackId }: { playlistId?: string; trackId: string }) => {
            if (!playlistId) {
                const { id: playlistId } = await createPlaylist(authStore.userId, 'New playlist');

                await addPlaylistTrack(playlistId, trackId);

                return { playlistId, isNewPlaylist: true };
            } else {
                await addPlaylistTrack(playlistId, trackId);

                return { playlistId };
            }
        },
        onSuccess: ({ playlistId, isNewPlaylist }) => {
            queryCache.invalidateQueries({
                key: ['playlistTracks', playlistId]
            });

            queryCache.invalidateQueries({
                key: ['playlist', playlistId]
            });

            queryCache.invalidateQueries({
                key: ['playlists', authStore.userId]
            });

            if (isNewPlaylist) {
                router.push(`/playlist/${playlistId}`);
            }
        }
    });
}

export function useRemovePlaylistTrack(playlistId: MaybeRef<string>) {
    const authStore = useAuthStore();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async (trackId: string) => {
            await removePlaylistTrack(toValue(playlistId), trackId);

            return trackId;
        },
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['playlistTracks', playlistId]
            });

            queryCache.invalidateQueries({
                key: ['playlist', playlistId]
            });

            queryCache.invalidateQueries({
                key: ['playlists', authStore.userId]
            });
        }
    });
}

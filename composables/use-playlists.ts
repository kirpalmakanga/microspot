import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/vue-query';
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
        queryKey: ['playlists', userId],
        queryFn: ({ pageParam: offset }) =>
            getUserPlaylists(toValue(userId), offset),
        initialPageParam: 0,
        getNextPageParam: ({ totalItemCount }, pages) => {
            const currentItemCount = pages.reduce(
                (count, { items }) => count + items.length,
                0
            );

            return currentItemCount < totalItemCount ? currentItemCount : null;
        }
    });
}

export function usePlaylist(playlistId: MaybeRef<string>) {
    return useQuery({
        queryKey: ['playlist', playlistId],
        queryFn: () => getPlaylist(toValue(playlistId))
    });
}

export function useUpdatePlaylist(playlistId: MaybeRef<string>) {
    const queryClient = useQueryClient();
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: async ({
            cover,
            ...playlistData
        }: {
            name: string;
            description: string;
            cover?: string;
        }) => {
            await updatePlaylist(toValue(playlistId), playlistData);

            if (cover && cover.startsWith('data:image')) {
                const encodedFile = cover.split(',').pop();

                encodedFile &&
                    (await updatePlaylistCover(
                        toValue(playlistId),
                        encodedFile
                    ));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['playlist', playlistId]
            });

            queryClient.invalidateQueries({
                queryKey: ['playlists', authStore.userId]
            });
        }
    });
}

export function usePlaylistTracks(playlistId: MaybeRef<string>) {
    const { data: playlist } = usePlaylist(playlistId);

    /** TODO: load saved tracks (playlistId === 'saved') */

    return useInfiniteQuery({
        queryKey: ['playlistTracks', playlistId],
        queryFn: ({ pageParam: offset }) =>
            getPlaylistTracks(toValue(playlistId), offset),
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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (trackId: string) => toggleSaveTrack(trackId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['playlistTracks', playlistId]
            });
        }
    });
}

export function useAddPlaylistTrack() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: async ({
            playlistId,
            trackId
        }: {
            playlistId?: string;
            trackId: string;
        }) => {
            if (!playlistId) {
                const { id: playlistId } = await createPlaylist(
                    authStore.userId,
                    'New playlist'
                );

                await addPlaylistTrack(playlistId, trackId);

                return { playlistId, isNewPlaylist: true };
            } else {
                await addPlaylistTrack(playlistId, trackId);

                return { playlistId };
            }
        },
        onSuccess: ({ playlistId, isNewPlaylist }) => {
            queryClient.invalidateQueries({
                queryKey: ['playlistTracks', playlistId]
            });

            queryClient.invalidateQueries({
                queryKey: ['playlist', playlistId]
            });

            queryClient.invalidateQueries({
                queryKey: ['playlists', authStore.userId]
            });

            if (isNewPlaylist) {
                router.push(`/playlist/${playlistId}`);
            }
        }
    });
}

export function useRemovePlaylistTrack(playlistId: MaybeRef<string>) {
    const authStore = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (trackId: string) => {
            await removePlaylistTrack(toValue(playlistId), trackId);

            return trackId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['playlistTracks', playlistId]
            });

            queryClient.invalidateQueries({
                queryKey: ['playlist', playlistId]
            });

            queryClient.invalidateQueries({
                queryKey: ['playlists', authStore.userId]
            });
        }
    });
}

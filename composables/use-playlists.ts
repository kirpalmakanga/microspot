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
        queryFn: async ({ pageParam: offset }) =>
            getUserPlaylists(toValue(userId), offset),
        initialPageParam: 0,
        getNextPageParam: ({ totalItemCount }, pages) => {
            const currentItemCount = pages.flatMap(({ items }) => items).length;

            return currentItemCount < totalItemCount ? currentItemCount : null;
        }
    });
}

// export function useAddPlaylistTrack() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async ({
//             playlistId,
//             trackId
//         }: {
//             playlistId: string;
//             trackId: string;
//         }) => {
//             await addPlaylistTrack(playlistId, trackId);

//             return await getPlaylist(playlistId);
//         },
//         onSuccess: (playlist) => {
//             queryClient.setQueryData(['playlists'], playlist);
//         }
//     });
// }

// export function useCreatePlaylist() {
//     const queryClient = useQueryClient();
//     const authStore = useAuthStore();

//     return useMutation({
//         mutationFn: (name: string) => createPlaylist(authStore.userId, name),
//         onSuccess: (playlist) =>
//             queryClient.setQueryData(['playlists'], (data) => {
//                 console.log('data', data);

//                 return data;
//             })
//     });
// }

export function usePlaylist(playlistId: MaybeRef<string>) {
    return useQuery({
        queryKey: ['playlist', playlistId],
        queryFn: () => getPlaylist(toValue(playlistId))
    });
}

export function useUpdatePlaylist(playlistId: MaybeRef<string>) {
    const authStore = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            name: string;
            description: string;
            cover?: string;
        }) => {
            const { cover, ...playlistData } = payload;

            await updatePlaylist(toValue(playlistId), playlistData);

            if (cover && cover.startsWith('data:image')) {
                const encodedFile = cover.split(',').pop();

                encodedFile &&
                    (await updatePlaylistCover(
                        toValue(playlistId),
                        encodedFile
                    ));
            }

            return payload;
        },
        onSuccess: ({ cover, ...playlistData }) => {
            function updater(playlist: Playlist) {
                return {
                    ...playlist,
                    ...playlistData,
                    ...(cover && {
                        images: { ...playlist.images, large: cover }
                    })
                };
            }

            queryClient.invalidateQueries({
                queryKey: ['playlist', playlistId]
            });
            queryClient.setQueryData(['playlist', playlistId], updater);

            queryClient.invalidateQueries({
                queryKey: ['playlists', authStore.userId]
            });
            queryClient.setQueryData(
                ['playlists', authStore.userId],
                ({
                    pages,
                    ...data
                }: {
                    pages: { items: Playlist[]; totalItemCount: number }[];
                }) => {
                    return {
                        ...data,
                        pages: pages.map((page) => {
                            const { items } = page;

                            const index = items.findIndex(
                                ({ id }) => id === toValue(playlistId)
                            );

                            if (index > -1) {
                                console.log('hey');

                                return {
                                    ...page,
                                    items: items.with(
                                        index,
                                        updater(items[index])
                                    )
                                };
                            }

                            return page;
                        })
                    };
                }
            );
        }
    });
}

export function usePlaylistTracks(playlistId: MaybeRef<string>) {
    const { data: playlist } = usePlaylist(playlistId);

    /** TODO: load saved tracks (playlistId === 'saved') */

    return useInfiniteQuery({
        queryKey: ['playlistTracks', playlistId],
        queryFn: async ({ pageParam: offset }) =>
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
        mutationFn: async (trackId: string) => {
            const isSaved = await toggleSaveTrack(trackId);

            return {
                trackId,
                isSaved
            };
        },
        onSuccess: ({ trackId, isSaved }) => {
            queryClient.invalidateQueries({
                queryKey: ['playlistTracks', playlistId]
            });
            queryClient.setQueryData(
                ['playlistTracks', playlistId],
                (tracks: PlaylistTrack[]) => {
                    const index = tracks.findIndex(({ id }) => id === trackId);

                    if (index > -1) {
                        return tracks.with(index, {
                            ...tracks[index],
                            isSaved
                        });
                    }

                    return tracks;
                }
            );
        }
    });
}

export function useRemovePlaylistTrack(playlistId: MaybeRef<string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (trackId: string) => {
            await removePlaylistTrack(toValue(playlistId), trackId);

            return trackId;
        },
        onSuccess: (trackId) => {
            queryClient.invalidateQueries({
                queryKey: ['playlistTracks', playlistId]
            });
            queryClient.setQueryData(
                ['playlistTracks', playlistId],
                (tracks: PlaylistTrack[]) => {
                    return tracks.filter(({ id }) => id !== trackId);
                }
            );
        }
    });
}

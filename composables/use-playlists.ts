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
    updatePlaylist,
    updatePlaylistCover
} from '~/services/spotify-api';

export function useUserPlaylists(userId?: MaybeRef<string>) {
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

export function useUpdatePlaylist(playlistId: MaybeRef<string>) {
    const queryClient = useQueryClient();

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

            queryClient.setQueryData(
                ['playlist', playlistId],
                (playlist: Playlist) => {
                    return {
                        ...playlist,
                        ...playlistData,
                        ...(cover && {
                            images: { ...playlist.images, large: cover }
                        })
                    };
                }
            );
        },
        onSuccess: () => {}
    });
}

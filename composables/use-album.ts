import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/vue-query';
import {
    getAlbum,
    getAlbumTracks,
    toggleSaveAlbum,
    toggleSaveTrack
} from '~/services/spotify-api';

export function useAlbum(albumId: MaybeRef<string>) {
    return useQuery({
        queryKey: ['album', albumId],
        queryFn: () => getAlbum(toValue(albumId))
    });
}

export function useAlbumTracks(albumId: MaybeRef<string>) {
    const { data: album } = useAlbum(albumId);

    return useInfiniteQuery({
        queryKey: ['albumTracks', albumId],
        queryFn: ({ pageParam: offset }) =>
            getAlbumTracks(toValue(albumId), offset),
        initialPageParam: 0,
        getNextPageParam: (_, pages) => {
            const { itemCount } = album?.value || {};

            if (!itemCount) {
                return 0;
            }

            const currentItemCount = pages.flat().length;

            return currentItemCount < itemCount ? currentItemCount : null;
        }
    });
}

export function useToggleSaveAlbum(albumId: MaybeRef<string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => toggleSaveAlbum(toValue(albumId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['album', albumId] });
        }
    });
}

export function useToggleSaveAlbumTrack(albumId: MaybeRef<string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (trackId: string) => toggleSaveTrack(trackId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['albumTracks', albumId]
            });
        }
    });
}

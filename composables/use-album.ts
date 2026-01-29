import { getAlbum, getAlbumTracks, toggleSaveAlbum, toggleSaveTrack } from '~/services/spotify-api';

export function useAlbum(albumId: MaybeRef<string>) {
    return useQuery({
        key: () => ['album', toValue(albumId)],
        query: () => getAlbum(toValue(albumId))
    });
}

export function useAlbumTracks(albumId: MaybeRef<string>) {
    const { data: album } = useAlbum(albumId);

    return useInfiniteQuery({
        key: () => ['albumTracks', toValue(albumId)],
        query: ({ pageParam: offset }) => getAlbumTracks(toValue(albumId), offset),
        initialPageParam: 0,
        getNextPageParam: (_, pages) => {
            const { itemCount = 0 } = album?.value || {};

            const currentItemCount = pages.flat().length;

            return currentItemCount < itemCount ? currentItemCount : null;
        }
    });
}

export function useToggleSaveAlbum(albumId: MaybeRef<string>) {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: () => toggleSaveAlbum(toValue(albumId)),
        onSuccess: () => {
            queryCache.invalidateQueries({ key: ['album', albumId] });
        }
    });
}

export function useToggleSaveAlbumTrack(albumId: MaybeRef<string>) {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: (trackId: string) => toggleSaveTrack(trackId),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['albumTracks', albumId]
            });
        }
    });
}

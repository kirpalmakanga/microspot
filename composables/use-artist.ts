import { getArtist, getArtistAlbums } from '~/services/spotify-api';

export function useArtist(artistId: MaybeRef<string>) {
    return useQuery({
        key: () => ['artist', artistId],
        query: () => getArtist(toValue(artistId))
    });
}

export function useArtistAlbums(artistId: MaybeRef<string>) {
    return useInfiniteQuery({
        key: () => ['artistAlbums', toValue(artistId)],
        query: ({ pageParam: offset }) => getArtistAlbums(toValue(artistId), offset),
        initialPageParam: 0,
        getNextPageParam: ({ albumCount }, pages) => {
            const currentItemCount = pages.reduce((count, { albums }) => count + albums.length, 0);

            return currentItemCount < albumCount ? currentItemCount : null;
        }
    });
}

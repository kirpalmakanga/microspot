import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import { getArtist, getArtistAlbums } from '~/services/spotify-api';

export function useArtist(artistId: MaybeRef<string>) {
    return useQuery({
        queryKey: ['artist', artistId],
        queryFn: () => getArtist(toValue(artistId))
    });
}

export function useArtistAlbums(artistId: MaybeRef<string>) {
    return useInfiniteQuery({
        queryKey: ['artistAlbums', artistId],
        queryFn: ({ pageParam: offset }) => getArtistAlbums(toValue(artistId), offset),
        initialPageParam: 0,
        getNextPageParam: ({ albumCount }, pages) => {
            const currentItemCount = pages.reduce((count, { albums }) => count + albums.length, 0);

            return currentItemCount < albumCount ? currentItemCount : null;
        }
    });
}

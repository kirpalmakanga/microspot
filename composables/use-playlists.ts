import { useInfiniteQuery } from '@tanstack/vue-query';
import { getUserPlaylists } from '~/services/spotify-api';

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

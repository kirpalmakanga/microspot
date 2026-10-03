import { getTrack, toggleSaveTrack } from '~/services/spotify-api';

export function useTrack(trackId: MaybeRef<string>) {
    return useQuery({
        key: ['track', toValue(trackId)],
        query: () => getTrack(toValue(trackId))
    });
}

export function useToggleSaveTrack() {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async (trackId: string) => {
            return {
                trackId,
                isSaved: await toggleSaveTrack(trackId)
            };
        },
        onSuccess: ({ trackId }) => {
            queryCache.invalidateQueries({
                key: ['track', trackId]
            });
        }
    });
}

import { getTrack, toggleSaveTrack } from '~/services/spotify-api';

export function useTrack(trackId: MaybeRef<string>) {
    return useQuery({
        key: ['track', toValue(trackId)],
        query: () => getTrack(toValue(trackId))
    });
}

export function useToggleSaveTrack(trackId: MaybeRef<string>) {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: (trackId: string) => toggleSaveTrack(toValue(trackId)),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['track', toValue(trackId)]
            });
        }
    });
}

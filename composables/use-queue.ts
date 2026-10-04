import { getPlayerQueue } from '~/services/spotify-api';

export function useQueue() {
    return useQuery({
        key: ['player-queue'],
        query: getPlayerQueue
    });
}

export function useToggleSaveQueueTrack() {
    const queryCache = useQueryCache();

    const { mutateAsync: toggleSaveTrack } = useToggleSaveTrack();

    return useMutation({
        mutation: async (trackId: string) => toggleSaveTrack(trackId),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['player-queue']
            });
        }
    });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { getTrack, toggleSaveTrack } from '~/services/spotify-api';

export function useTrack(trackId: MaybeRef<string>) {
    return useQuery({
        queryKey: ['track', trackId],
        queryFn: () => getTrack(toValue(trackId))
    });
}

export function useToggleSaveTrack(trackId: MaybeRef<string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (trackId: string) =>
            toggleSaveTrack(toValue(trackId)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['track', trackId]
            });
        }
    });
}

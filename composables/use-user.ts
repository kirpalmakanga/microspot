import { useQuery } from '@tanstack/vue-query';
import { getUser } from '~/services/spotify-api';

export function useUser(userId: MaybeRef<string>) {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => getUser(toValue(userId))
    });
}

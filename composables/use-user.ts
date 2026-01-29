import { getUser } from '~/services/spotify-api';

export function useUser(userId: MaybeRef<string>) {
    return useQuery({
        key: () => ['user', toValue(userId)],
        query: () => getUser(toValue(userId))
    });
}

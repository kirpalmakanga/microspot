import { getAvailableDevices, setActiveDevice } from '~/services/spotify-api';

export function useAvailableDevices() {
    return useQuery({
        key: () => ['devices'],
        query: getAvailableDevices
    });
}

export function useSetActiveDevice() {
    const playerStore = usePlayerStore();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: (deviceId: string) => setActiveDevice(deviceId, playerStore.isPlaying),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['devices']
            });
        }
    });
}

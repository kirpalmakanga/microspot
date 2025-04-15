import axios from 'axios';

const loadPlayerAPI = async () => {
    if (!window.Spotify) {
        const promise = new Promise(
            (resolve) =>
                (window.onSpotifyWebPlaybackSDKReady = () => resolve(null))
        );

        await loadScript('https://sdk.scdn.co/spotify-player.js');

        return promise;
    }
};

interface State {
    isPlaying: boolean;
    isReady: boolean;
    cannotSkipToPrevious: boolean;
    cannotSkipToNext: boolean;
    currentTrack: {
        id: string;
        name: string;
        artists: Artist[];
        images: Images;
        duration: number;
        uri: string;
        isSaved: boolean;
    };
    currentTrackPosition: number;
    localDeviceId: string;
    availableDevices: Device[];
}

const getDefaultState = () => ({
    isPlaying: false,
    isReady: false,
    cannotSkipToPrevious: true,
    cannotSkipToNext: true,
    currentTrack: {
        id: '',
        name: '',
        artists: [],
        images: { small: '', medium: '', large: '' },
        duration: 0,
        uri: '',
        isSaved: false
    },
    currentTrackPosition: 0,
    localDeviceId: '',
    availableDevices: []
});

export const useSpotifyPlayer = () => {
    const { isTrackSaved, toggleSaveTrack } = useSpotifyApi();
    const { refreshAccessToken } = useAuthStore();
    const playerStore = usePlayerStore();

    const state = reactive<State>(getDefaultState());
    const playerInstance = ref<Spotify.Player>();
    const timeWatcher = ref<ReturnType<typeof setInterval>>();

    async function parseCurrentTrackData({
        id,
        uri,
        name,
        duration_ms,
        album: {
            images: [
                { url: large = '' },
                { url: medium = '' },
                { url: small = '' }
            ] = []
        },
        artists
    }: Spotify.Track) {
        if (id !== state.currentTrack.id) {
            state.currentTrack = {
                id,
                uri,
                name,
                artists: artists.map(({ name, uri }) => ({
                    id: uri.split(':').pop() || '',
                    name,
                    uri,
                    images: { small: '', medium: '', large: '' }
                })),
                images: { large, medium, small },
                duration: duration_ms,
                isSaved: await isTrackSaved(id)
            };
        }
    }

    async function parseCurrentState({
        position: currentTrackPosition,
        paused,
        disallows: {
            skipping_prev: disallowSkippingPrev,
            skipping_next: disallowSkippingNext
        },
        track_window: {
            current_track: trackData,
            previous_tracks: previousTracks,
            next_tracks: nextTracks
        },
        context: { uri }
    }: Spotify.PlaybackState) {
        if (!trackData) return;

        const cannotSkipToPrevious =
            disallowSkippingPrev || previousTracks.length === 0;
        const cannotSkipToNext =
            disallowSkippingNext || nextTracks.length === 0;

        if (cannotSkipToPrevious !== state.cannotSkipToPrevious) {
            state.cannotSkipToPrevious = cannotSkipToPrevious;
        }

        if (cannotSkipToNext !== state.cannotSkipToNext) {
            state.cannotSkipToNext = cannotSkipToNext;
        }

        if (currentTrackPosition !== state.currentTrackPosition) {
            state.currentTrackPosition = currentTrackPosition;
        }

        playerStore.isPlaying = !paused;
        state.isPlaying = !paused;

        await parseCurrentTrackData(trackData);

        Object.assign(playerStore.context, {
            uri,
            currentTrack: state.currentTrack,
            currentTrackPosition: state.currentTrackPosition
        });
    }

    async function setCurrentTrack({
        contextUri,
        trackUri,
        position = 0
    }: {
        contextUri: string;
        trackUri?: string;
        position?: number;
    }) {
        const { localDeviceId } = state;

        await axios.put(
            '/me/player/play',
            {
                ...(contextUri === trackUri || !contextUri
                    ? {
                          uris: [trackUri]
                      }
                    : {
                          context_uri: contextUri,
                          ...(contextUri.includes('artist')
                              ? {}
                              : {
                                    offset: trackUri
                                        ? { uri: trackUri }
                                        : { position: 0 }
                                })
                      }),
                position_ms: position
            },
            {
                params: {
                    device_id: localDeviceId
                }
            }
        );
    }

    async function onPlayerReady({
        device_id: localDeviceId
    }: Spotify.WebPlaybackInstance) {
        const {
            context: { currentTrack, currentTrackPosition }
        } = playerStore;

        Object.assign(state, {
            currentTrack,
            localDeviceId,
            currentTrackPosition
        });

        playerInstance.value?.addListener(
            'player_state_changed',
            (state: Spotify.PlaybackState) => {
                if (state) parseCurrentState(state);
            }
        );

        state.isReady = true;
    }

    function onPlayerNotReady() {
        state.isReady = false;
    }

    watch(
        () => state.isPlaying,
        (isPlaying) => {
            if (timeWatcher.value) clearInterval(timeWatcher.value);

            if (isPlaying) {
                timeWatcher.value = setInterval(async () => {
                    if (!state.isPlaying) {
                        return;
                    }

                    const currentState =
                        await playerInstance.value?.getCurrentState();

                    if (currentState) {
                        state.currentTrackPosition = currentState.position;
                        playerStore.context.currentTrackPosition =
                            currentState.position;
                    }
                }, 200);
            }
        }
    );

    return {
        ...toRefs(state),
        async init() {
            await loadPlayerAPI();

            playerInstance.value = new window.Spotify.Player({
                name: 'MicroSpot',
                getOAuthToken: async (callback) => {
                    const accessToken = await refreshAccessToken();

                    callback(accessToken);
                }
            });

            playerInstance.value?.addListener('ready', onPlayerReady);
            playerInstance.value?.addListener('not_ready', onPlayerNotReady);

            await playerInstance.value?.connect();
        },
        destroy() {
            if (playerInstance.value) {
                playerInstance.value.removeListener('ready');
                playerInstance.value.removeListener('not_ready');
                playerInstance.value.removeListener('player_state_changed');

                playerInstance.value.disconnect();

                Object.assign(state, getDefaultState());
            }
        },
        async play() {
            if (!playerInstance.value) {
                return;
            }

            const {
                context: { uri, currentTrack, currentTrackPosition }
            } = playerStore;

            if (
                (uri || currentTrack.uri) &&
                !(await playerInstance.value.getCurrentState())
            ) {
                await setCurrentTrack({
                    contextUri: uri,
                    trackUri: currentTrack.uri,
                    position: currentTrackPosition
                });
            } else {
                await playerInstance.value.resume();
            }

            state.isPlaying = true;
        },
        async pause() {
            if (playerInstance.value) {
                await playerInstance.value.pause();

                state.isPlaying = false;
            }
        },
        seek(position: number) {
            playerInstance.value?.seek(position);

            state.currentTrackPosition = position;
        },
        goToPreviousTrack() {
            playerInstance.value?.previousTrack();
        },
        goToNextTrack() {
            playerInstance.value?.nextTrack();
        },
        setCurrentTrack,
        async fetchDevices() {
            const {
                data: { devices }
            } = await axios('/me/player/devices');

            state.availableDevices = devices.map(parseDeviceData);
        },
        setActiveDevice(id: string) {
            axios.put('/me/player', {
                device_ids: [id],
                play: state.isPlaying
            });

            for (const device of state.availableDevices) {
                device.isActive = device.id === id;
            }
        },
        async toggleSaveCurrentTrack() {
            const {
                currentTrack: { id }
            } = state;

            state.currentTrack.isSaved = await toggleSaveTrack(id);
        }
    };
};

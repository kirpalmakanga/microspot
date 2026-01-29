import {
    getAvailableDevices,
    isTrackSaved,
    setActiveDevice,
    setCurrentContext,
    toggleSaveTrack,
    type PlaybackContext
} from '~/services/spotify-api';

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

async function loadPlayerAPI() {
    if (!window.Spotify) {
        const promise = new Promise(
            (resolve) => (window.onSpotifyWebPlaybackSDKReady = () => resolve(null))
        );

        await loadScript('https://sdk.scdn.co/spotify-player.js');

        return promise;
    }
}

const getDefaultState = (): State => ({
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

export function useSpotifyPlayer() {
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
        album: { images: [{ url: large = '' }, { url: medium = '' }, { url: small = '' }] = [] },
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
        disallows: { skipping_prev: disallowSkippingPrev, skipping_next: disallowSkippingNext },
        track_window: {
            current_track: trackData,
            previous_tracks: previousTracks,
            next_tracks: nextTracks
        },
        context: { uri }
    }: Spotify.PlaybackState) {
        if (!trackData) return;

        const cannotSkipToPrevious = disallowSkippingPrev || previousTracks.length === 0;
        const cannotSkipToNext = disallowSkippingNext || nextTracks.length === 0;

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

    async function setContext(context: PlaybackContext) {
        await setCurrentContext(context, state.localDeviceId);
    }

    async function onPlayerReady({ device_id: localDeviceId }: Spotify.WebPlaybackInstance) {
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

    async function play() {
        if (!playerInstance.value) {
            return;
        }

        const {
            context: { uri, currentTrack, currentTrackPosition }
        } = playerStore;

        if ((uri || currentTrack.uri) && !(await playerInstance.value.getCurrentState())) {
            await setContext({
                contextUri: uri,
                trackUri: currentTrack.uri,
                position: currentTrackPosition
            });
        } else {
            await playerInstance.value.resume();
        }

        state.isPlaying = true;
    }

    async function pause() {
        if (playerInstance.value) {
            await playerInstance.value.pause();

            state.isPlaying = false;
        }
    }

    function togglePlay() {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    }

    async function fetchCurrentTrackPosition() {
        if (!state.isPlaying) {
            return;
        }

        const currentState = await playerInstance.value?.getCurrentState();

        if (currentState) {
            state.currentTrackPosition = currentState.position;
            playerStore.context.currentTrackPosition = currentState.position;
        }
    }

    watch(
        () => state.isPlaying,
        (isPlaying) => {
            if (timeWatcher.value) {
                clearInterval(timeWatcher.value);
            }

            if (isPlaying) {
                timeWatcher.value = setInterval(fetchCurrentTrackPosition, 200);
            }
        }
    );

    return {
        ...toRefs(state),
        async init() {
            await loadPlayerAPI();

            playerInstance.value = new window.Spotify.Player({
                name: 'MicroSpot',
                async getOAuthToken(callback) {
                    const accessToken = await refreshAccessToken();

                    callback(accessToken);
                }
            });

            playerInstance.value?.addListener('ready', onPlayerReady);
            playerInstance.value?.addListener('not_ready', onPlayerNotReady);

            await playerInstance.value?.connect();

            emitter.on('launch', setContext);
            emitter.on('togglePlay', togglePlay);
        },
        destroy() {
            if (playerInstance.value) {
                playerInstance.value.removeListener('ready');
                playerInstance.value.removeListener('not_ready');
                playerInstance.value.removeListener('player_state_changed');

                playerInstance.value.disconnect();

                Object.assign(state, getDefaultState());

                emitter.off('launch', setContext);
                emitter.off('togglePlay', togglePlay);
            }
        },
        togglePlay,
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
        async fetchAvailableDevices() {
            state.availableDevices = await getAvailableDevices();
        },
        selectActiveDevice(id: string) {
            setActiveDevice(id, state.isPlaying);

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
}

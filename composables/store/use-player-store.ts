import { isTrackSaved, setCurrentContext, type PlaybackContext } from '~/services/spotify-api';

interface State {
    isPlaying: boolean;
    isReady: boolean;
    cannotSkipToPrevious: boolean;
    cannotSkipToNext: boolean;
    contextUri: string;
    track: {
        id: string;
        name: string;
        artists: Artist[];
        images: Images;
        duration: number;
        uri: string;
        isSaved: boolean;
    };
    trackPosition: number;
    localDeviceId: string;
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
    contextUri: '',
    track: {
        id: '',
        name: '',
        artists: [],
        images: { small: '', medium: '', large: '' },
        duration: 0,
        uri: '',
        isSaved: false
    },
    trackPosition: 0,
    localDeviceId: ''
});

export const usePlayerStore = defineStore(
    'player',
    () => {
        const { refreshAccessToken } = useAuthStore();

        const state = reactive<State>(getDefaultState());
        const playerInstance = ref<Spotify.Player>();
        const timeWatcher = ref<ReturnType<typeof setInterval>>();

        const defaultImage = { url: '' };

        const { mutateAsync: toggleSaveTrack } = useToggleSaveTrack();

        async function parseCurrentTrackData({
            id,
            uri,
            name,
            duration_ms,
            album: {
                images: [
                    { url: large = '' } = defaultImage,
                    { url: medium = '' } = defaultImage,
                    { url: small = '' } = defaultImage
                ] = []
            },
            artists
        }: Spotify.Track) {
            if (id !== state.track.id) {
                state.track = {
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
            position: trackPosition,
            paused,
            disallows: { skipping_prev: disallowSkippingPrev, skipping_next: disallowSkippingNext },
            track_window: {
                current_track: trackData,
                previous_tracks: previousTracks,
                next_tracks: nextTracks
            }
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

            if (trackPosition !== state.trackPosition) {
                state.trackPosition = trackPosition;
            }

            state.isPlaying = !paused;

            await parseCurrentTrackData(trackData);
        }

        async function setContext(context: PlaybackContext) {
            state.contextUri = context.contextUri;

            await setCurrentContext(context, state.localDeviceId);
        }

        async function onPlayerReady({ device_id: localDeviceId }: Spotify.WebPlaybackInstance) {
            state.localDeviceId = localDeviceId;

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
                contextUri,
                track: { uri: trackUri },
                trackPosition
            } = state;

            if ((contextUri || trackUri) && !(await playerInstance.value.getCurrentState())) {
                await setContext({
                    contextUri,
                    trackUri,
                    position: trackPosition
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

        function isCurrentContext(targetContextUri: string, targetTrackUri?: string) {
            const {
                contextUri,
                track: { uri: trackUri }
            } = state;

            return (
                targetContextUri === contextUri && (!targetTrackUri || targetTrackUri === trackUri)
            );
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
                state.trackPosition = currentState.position;
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
            isCurrentContext,
            togglePlay,
            toggleContextPlay(contextUri: string, trackUri?: string) {
                if (isCurrentContext(contextUri, trackUri)) {
                    togglePlay();
                } else {
                    setContext({ contextUri, trackUri });
                }
            },
            seek(position: number) {
                playerInstance.value?.seek(position);

                state.trackPosition = position;
            },
            goToPreviousTrack() {
                playerInstance.value?.previousTrack();
            },
            goToNextTrack() {
                playerInstance.value?.nextTrack();
            },
            async toggleSaveCurrentTrack() {
                const { isSaved } = await toggleSaveTrack(state.track.id);

                state.track.isSaved = isSaved;
            }
        };
    },
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage(),
            pick: ['contextUri', 'track', 'trackPosition']
        }
    }
);

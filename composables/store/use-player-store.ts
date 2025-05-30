interface State {
    context: {
        uri: string;
        currentTrack: {
            id: string;
            name: string;
            artists: Artist[];
            cover: string;
            duration: number;
            uri: string;
        };
        currentTrackPosition: number;
    };
    isPlaying: boolean;
}

interface PlaybackContext {
    contextUri: string;
    trackUri?: string;
}

const getDefaultState = (): State => ({
    context: {
        uri: '',
        currentTrack: {
            id: '',
            name: '',
            artists: [],
            cover: '',
            duration: 0,
            uri: ''
        },
        currentTrackPosition: 0
    },
    isPlaying: false
});

export const usePlayerStore = defineStore(
    'player',
    () => {
        const state = reactive<State>(getDefaultState());

        const isCurrentContext = (
            targetContextUri: string,
            targetTrackUri?: string
        ) => {
            const {
                context: {
                    uri,
                    currentTrack: { uri: trackUri }
                }
            } = state;

            return (
                uri === targetContextUri &&
                (targetTrackUri ? trackUri === targetTrackUri : true)
            );
        };

        return {
            ...toRefs(state),
            isCurrentContext,
            togglePlay({ contextUri, trackUri }: PlaybackContext) {
                if (isCurrentContext(contextUri, trackUri)) {
                    emitter.emit('togglePlay');
                } else {
                    state.context.uri = contextUri;

                    emitter.emit('launch', { contextUri, trackUri });
                }
            }
        };
    },
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage()
        }
    }
);

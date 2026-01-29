import { exchangeCodeForTokens, refreshAccessToken } from '~/services/auth-api';
import { getCurrentUserData } from '~/services/spotify-api';

interface State {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userName: string;
    profilePicture: string;
}

const getDefaultState = (): State => ({
    accessToken: '',
    refreshToken: '',
    userId: '',
    userName: '',
    profilePicture: ''
});

export const useAuthStore = defineStore(
    'auth',
    () => {
        const state = reactive<State>(getDefaultState());

        return {
            ...toRefs(state),
            isLoggedIn: computed(() => !!state.accessToken),
            async fetchAccessToken(authorizationCode: string) {
                const tokens = await exchangeCodeForTokens(authorizationCode);

                Object.assign(state, tokens);
            },
            async refreshAccessToken() {
                const accessToken = await refreshAccessToken(state.refreshToken);

                state.accessToken = accessToken;

                return accessToken as string;
            },
            async fetchUserData() {
                const { id: userId, name: userName, profilePicture } = await getCurrentUserData();

                Object.assign(state, {
                    userId,
                    userName,
                    profilePicture
                });
            },
            async logOut() {
                Object.assign(state, getDefaultState());
            }
        };
    },
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage()
        }
    }
);

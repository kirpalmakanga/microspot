import axios from 'axios';

const AUTH_API_URL = window.location.origin;

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
            async getAccessToken(code: string) {
                const {
                    data: { accessToken, refreshToken }
                } = await axios(`${AUTH_API_URL}/api/token/${code}`);

                state.accessToken = accessToken;
                state.refreshToken = refreshToken;
            },
            async refreshAccessToken() {
                const {
                    data: { accessToken }
                } = await axios(
                    `${AUTH_API_URL}/api/refresh/${state.refreshToken}`
                );

                state.accessToken = accessToken;

                return accessToken;
            },
            async getUserData() {
                const {
                    data: {
                        id: userId,
                        display_name: userName,
                        images: [{ url: profilePicture = '' } = {}]
                    }
                } = await axios('/me');

                Object.assign(state, {
                    userId,
                    userName,
                    profilePicture
                });
            },
            async logIn() {
                const {
                    data: { url }
                } = await axios(`${AUTH_API_URL}/api/login`);

                window.location.href = url;
            },
            async logOut() {
                Object.assign(state, getDefaultState());
            }
        };
    },
    {
        persist: {
            key: 'auth',
            storage: persistedState.localStorage
        }
    }
);

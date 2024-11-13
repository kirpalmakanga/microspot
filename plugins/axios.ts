import axios from 'axios';

export default defineNuxtPlugin(() => {
    axios.defaults.baseURL = 'https://api.spotify.com/v1';

    axios.interceptors.request.use((config) => {
        const { accessToken } = useAuthStore();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    });

    // Add a response interceptor
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { refreshAccessToken, logOut } = useAuthStore();
            const {
                response: { status },
                config
            } = error;

            if (status === 401 && !config._retry) {
                await refreshAccessToken();

                config._retry = true;

                return axios(config);
            } else if (status === 401) {
                await logOut();

                navigateTo('/login');
            }

            return Promise.reject(error);
        }
    );
});

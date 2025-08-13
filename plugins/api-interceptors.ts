import { apiInstance } from '~/services/spotify-api';

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();
    const { refreshAccessToken, logOut } = authStore;
    const { accessToken } = storeToRefs(authStore);

    apiInstance.interceptors.request.use((config) => {
        if (accessToken.value) {
            config.headers.Authorization = `Bearer ${accessToken.value}`;
        }

        return config;
    });

    apiInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const {
                response: { status },
                config
            } = error;

            if (status === 401 && !config._retry) {
                config._retry = true;

                try {
                    await refreshAccessToken();

                    return apiInstance(config);
                } catch (refreshError) {
                    await logOut();

                    navigateTo('/login');

                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );
});

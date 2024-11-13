export default defineNuxtRouteMiddleware(({ name }) => {
    const { isLoggedIn } = useAuthStore();

    if (name === 'login' && isLoggedIn) return navigateTo('/');
    else if (name !== 'login' && !isLoggedIn) return navigateTo('/login');
});

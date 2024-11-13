<template>
    <section class="relative grow">
        <Loader />
    </section>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
    const {
        query: { code }
    } = route;

    if (typeof code === 'string') {
        await auth.getAccessToken(code);
        await auth.getUserData();

        router.replace('/');
    }
});
</script>

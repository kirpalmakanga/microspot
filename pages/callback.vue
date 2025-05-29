<template>
    <section class="flex items-center justify-center relative grow">
        <div class="flex flex-col items-center">
            <Loader />

            <p>Logging in...</p>
        </div>
    </section>
</template>

<script setup lang="ts">
const {
    query: { code }
} = useRoute();
const router = useRouter();
const { fetchAccessToken, fetchUserData } = useAuthStore();

onMounted(async () => {
    if (typeof code === 'string') {
        await fetchAccessToken(code);
        await fetchUserData();

        router.replace('/');
    }
});

definePageMeta({
    layout: 'empty'
});
</script>

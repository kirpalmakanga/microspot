<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const query = ref<string>('');

function updateSearchRoute() {
    const {
        params: { tab }
    } = route;

    router.replace({
        name: 'search-query-tab',
        ...(query.value && {
            params: {
                query: query.value,
                ...(tab && { tab })
            }
        })
    });
}

function clearQuery() {
    query.value = '';

    updateSearchRoute();
}

watch(query, () => {
    if (query.value) {
        updateSearchRoute();
    }
});

watch(
    route,
    ({ params: { query: routeQuery } }) => {
        if (routeQuery !== query.value) {
            query.value = routeQuery as string;
        }
    },
    { immediate: true }
);
</script>

<template>
    <UInput
        class="grow pr-2.5"
        variant="soft"
        placeholder="Search"
        v-model="query"
    >
        <template v-if="query" #trailing>
            <UButton
                class="rounded-l-none rounded-r-md cursor-pointer"
                icon="i-mi-close"
                variant="soft"
                color="neutral"
                @click="clearQuery"
            />
        </template>
    </UInput>
</template>

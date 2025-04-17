<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const searchStore = useSearchStore();
const { query } = storeToRefs(searchStore);
const { clearSearch } = searchStore;

const targetRouteName = 'search-query-tab';

/** TODO: throttle ? */
watch(query, (query) => {
    const {
        params: { tab = '', query: routeQuery }
    } = route;

    /** TODO: simplify */
    if (query && (route.name !== targetRouteName || query !== routeQuery)) {
        router.replace({
            name: targetRouteName,
            ...(query && {
                params: {
                    query,
                    ...(tab && { tab })
                }
            })
        });
    }
});

watch(route, ({ name, params: { query: routeQuery } }) => {
    if (name === 'search-query-tab' && routeQuery) {
        query.value = routeQuery as string;
    }
});
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
                @click="clearSearch"
            />
        </template>
    </UInput>
</template>

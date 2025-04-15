<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';

const router = useRouter();
const route = useRoute();
const searchStore = useSearchStore();
const { query } = storeToRefs(searchStore);
const { clearSearch } = searchStore;

watchDebounced(
    query,
    (query) => {
        const {
            params: { tab = '' }
        } = route;

        if (query && route.name !== 'search-query-tab') {
            router.replace({
                name: 'search-query-tab',
                ...(query && {
                    params: {
                        query,
                        ...(tab && { tab })
                    }
                })
            });
        }
    },
    { debounce: 500 }
);

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

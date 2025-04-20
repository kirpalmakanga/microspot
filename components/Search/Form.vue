<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';

const router = useRouter();
const route = useRoute();

const query = ref<string>('');

const searchPageName = 'search-query-tab';

function hasQuery() {
    return !!query.value;
}

function isSearchPage() {
    return route.name === searchPageName;
}

function updateSearchRoute() {
    const {
        params: { tab }
    } = route;

    router.replace({
        name: searchPageName,
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
}

watchDebounced(
    query,
    () => {
        if (hasQuery() || isSearchPage()) {
            updateSearchRoute();
        }
    },
    {
        debounce: 400
    }
);

watch(
    route,
    ({ params: { query: routeQuery } }) => {
        if (hasQuery() && !isSearchPage()) {
            query.value = '';
        } else if (routeQuery && routeQuery !== query.value) {
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

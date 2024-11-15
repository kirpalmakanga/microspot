<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const searchStore = useSearchStore();
const { query } = storeToRefs(searchStore);
const { clearSearch } = searchStore;

watch(
    query,
    debounce(() => {
        const {
            params: { tab = '' }
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
    }, 500)
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
                @click="clearSearch"
            />
        </template>
    </UInput>
</template>

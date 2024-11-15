<script setup lang="ts">
const searchStore = useSearchStore();
const { query } = storeToRefs(searchStore);
const { clearSearch } = searchStore;
</script>

<template>
    <LayoutHeader>
        <template #nav-left>
            <BackButton />
        </template>

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
    </LayoutHeader>
</template>

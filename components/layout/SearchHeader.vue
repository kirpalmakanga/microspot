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
            class="grow"
            variant="soft"
            placeholder="Search"
            v-model="query"
        >
            <template v-if="query" #trailing>
                <UButton
                    class="rounded-none rounded-r-md -me-2.5 cursor-pointer"
                    icon="i-mi-close"
                    variant="soft"
                    color="neutral"
                    @click="clearSearch"
                />
            </template>
        </UInput>
    </LayoutHeader>
</template>

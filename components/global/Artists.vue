<script setup lang="ts">
defineProps<{ items: Artist[] }>();
</script>

<template>
    <span>
        <template v-for="({ id, name }, index) of items" :key="id">
            <template v-if="index > 0">
                {{ ', ' }}
            </template>

            <NuxtLink
                class="opacity-60 hover:opacity-100 hover:underline transition-opacity"
                :to="`/artist/${id}`"
            >
                {{ name }}
            </NuxtLink>
        </template>
    </span>
</template>

<script setup lang="ts">
defineProps<{ icon: string }>();
</script>

<template>
    <button
        class="size-8 transition-transform transform hover:scale-110 hover:active:scale-90 cursor-pointer"
    >
        <UIcon class="size-full" :name="icon" />
    </button>
</template>

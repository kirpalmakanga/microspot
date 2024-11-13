<template>
    <button
        class="flex items-center justify-center h-16 w-16 bg-indigo-500 hover:scale-110 hover:active:scale-90 transform transition rounded-full cursor-pointer"
    >
        <UIcon class="size-8" :name="isPlaying ? 'i-mi-pause' : 'i-mi-play'" />
    </button>
</template>

<script setup lang="ts">
defineProps<{ isPlaying: boolean }>();
</script>

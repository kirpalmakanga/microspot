<script setup lang="ts">
defineProps<{ icon: string; disabled?: boolean }>();
</script>

<template>
    <button
        class="group w-12 bg-zinc-900 inline-flex items-center justify-center cursor-pointer"
        :class="{ 'pointer-events-none': disabled }"
    >
        <UIcon
            class="w-6 h-6 transform transition-transform group-hover:scale-120 group-hover:active:scale-90"
            :class="{ 'opacity-50': disabled }"
            :name="icon"
        />
    </button>
</template>

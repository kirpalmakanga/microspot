<template>
    <button
        class="flex items-center justify-center h-12 w-12 cursor-pointer"
        @click.prevent="handleClick"
    >
        <UIcon class="size-6" name="i-mi-arrow-left" />
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
const router = useRouter();

const handleClick = () => {
    if (window.history.length > 1) {
        router.back();
        return;
    }

    router.replace('/');
};
</script>

<script setup lang="ts">
import { useScroll } from '@vueuse/core';

defineProps<{ scrollableClass?: string }>();

const innerContainer = ref<HTMLDivElement>();

const emit = defineEmits<{
    scroll: [e: Event];
    'reached-bottom': [e: void];
}>();

const { arrivedState } = useScroll(innerContainer, {
    behavior: 'smooth',
    offset: { bottom: 300 },
    throttle: 100
});

watch(
    () => arrivedState.bottom,
    (bottom) => {
        if (bottom) {
            emit('reached-bottom');
        }
    }
);
</script>

<template>
    <div class="grow relative overflow-hidden">
        <div
            ref="innerContainer"
            class="absolute top-0 left-0 right-0 bottom-0 overflow-auto"
            :class="scrollableClass"
        >
            <slot />
        </div>
    </div>
</template>

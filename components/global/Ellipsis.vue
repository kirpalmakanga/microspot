<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';

const props = defineProps<{ hasTooltip?: boolean }>();

const wrapper = useTemplateRef<HTMLElement>('wrapper');
const tooltip = ref<string>('');
const stopObserver = ref<(() => void) | null>(null);

function startResizeObserver() {
    const { stop } = useResizeObserver(wrapper, () => {
        const { value } = wrapper;

        if (value && value.offsetWidth < value.scrollWidth) {
            tooltip.value = value.textContent || '';
        } else {
            tooltip.value = '';
        }
    });

    stopObserver.value = stop;
}

function stopResizeObserver() {
    if (stopObserver.value) {
        stopObserver.value();

        stopObserver.value = null;
    }
}

onMounted(() => {
    if (props.hasTooltip) {
        startResizeObserver();
    }
});

watch(
    () => props.hasTooltip,
    (hasTooltip) => {
        if (hasTooltip) {
            startResizeObserver();
        } else {
            stopResizeObserver();
        }
    }
);
</script>

<template>
    <UTooltip
        :ui="{ content: 'h-auto max-w-md', text: 'whitespace-normal' }"
        :content="{
            side: 'top'
        }"
        :text="tooltip"
        :disabled="!tooltip"
    >
        <span>
            <span ref="wrapper" class="block truncate">
                <slot />
            </span>
        </span>
    </UTooltip>
</template>

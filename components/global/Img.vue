<template>
    <span class="relative flex items-center justify-center overflow-hidden">
        <Transition name="fade" mode="out-in">
            <UIcon
                v-if="!src || isLoading || hasError"
                class="size-1/2"
                :class="{ 'animate-pulse': isLoading }"
                name="i-mi-image"
            />

            <img
                v-else-if="!isLoading"
                class="block transition-opacity object-cover object-center w-full h-full"
                :class="{
                    [imgClass || '']: !!imgClass
                }"
                :src="src"
                :alt="altText"
            />
        </Transition>
    </span>
</template>

<script setup lang="ts">
const props = defineProps<{
    src?: string;
    imgClass?: string;
    altText?: string;
}>();

const isLoading = ref<boolean>(true);
const hasError = ref<boolean>(false);

watch(
    () => props.src,
    async () => {
        try {
            if (!props.src) return;

            const img = new Image();

            img.src = props.src;

            if (!img.complete) {
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
            }
        } catch (e) {
            hasError.value = true;
        } finally {
            isLoading.value = false;
        }
    },
    { immediate: true }
);
</script>

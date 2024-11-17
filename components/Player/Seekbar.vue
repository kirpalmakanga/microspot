<script setup lang="ts">
const props = defineProps<{ position: number; duration: number }>();

const emit = defineEmits<{ update: [position: number] }>();

const container = useTemplateRef('container');

const seekingPosition = ref<number>(0);

const progress = computed(() => props.position / props.duration);

async function handleMouseMove({ pageX }: MouseEvent) {
    if (container.value) {
        const { left } = container.value.getBoundingClientRect();

        await nextFrame();

        seekingPosition.value = (pageX - left) / container.value.offsetWidth;
    }
}

async function handleMouseLeave() {
    await nextFrame();

    seekingPosition.value = 0;
}

function handleMouseUp() {
    emit('update', seekingPosition.value * props.duration);
}
</script>

<template>
    <div
        ref="container"
        class="relative w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        @mouseup="handleMouseUp"
    >
        <span
            class="absolute inset-0 bg-zinc-500"
            :style="`transform: translateX(${100 * seekingPosition - 100}%)`"
        />

        <span
            class="absolute inset-0 bg-indigo-400"
            :style="`transform: translateX(${100 * progress - 100}%)`"
        />
    </div>
</template>

<script setup lang="ts">
defineProps<{ position: number; duration: number }>();

const emit = defineEmits<{ change: [position: number] }>();

const isSeeking = ref<boolean>(false);
const seekingPosition = ref<number>(0);

function handleInput({ currentTarget }: Event) {
    if (currentTarget instanceof HTMLInputElement) {
        seekingPosition.value = parseInt(currentTarget.value);
    }
}

function handleStartSeeking() {
    isSeeking.value = true;
}

function handleStopSeeking() {
    emit('change', seekingPosition.value);

    seekingPosition.value = 0;
    isSeeking.value = false;
}
</script>

<template>
    <input
        class="w-full"
        :class="{ 'cursor-pointer': !!duration }"
        :value="isSeeking ? seekingPosition : position"
        type="range"
        :min="0"
        :max="duration"
        :disabled="!duration"
        @mousedown="handleStartSeeking"
        @mouseup="handleStopSeeking"
        @input="handleInput"
    />
</template>

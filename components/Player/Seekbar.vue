<template>
    <input
        class="cursor-pointer w-full"
        :value="isSeeking ? seekingPosition : position"
        type="range"
        :min="0"
        :max="duration"
        @mousedown="handleStartSeeking"
        @mouseup="handleStopSeeking"
        @input="handleInput"
    />
</template>

<script setup lang="ts">
defineProps<{ position: number; duration: number }>();

const emit = defineEmits<{ change: [position: number] }>();

const isSeeking = ref<boolean>(false);
const seekingPosition = ref<number>(0);

function handleStartSeeking() {
    isSeeking.value = true;
}

function handleInput({ target }: Event) {
    if (target instanceof HTMLInputElement) {
        seekingPosition.value = parseInt(target.value);
    }
}

function handleStopSeeking({ target }: MouseEvent) {
    if (target instanceof HTMLInputElement) {
        emit('change', parseInt(target.value));

        isSeeking.value = false;
    }

    seekingPosition.value = 0;
}
</script>

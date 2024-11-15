<script setup lang="ts">
const iconsByType: Record<string, string> = {
    computer: 'i-mi-computer',
    smartphone: 'i-mi-mobile',
    speaker: 'i-mi-speakers'
};

defineEmits<{ select: [id: string] }>();

const props = defineProps<{ items: Device[] }>();

const activeDevice = computed(() =>
    props.items.find(({ isActive }) => isActive)
);

const availableDevices = computed(() =>
    props.items.filter(({ isActive }) => !isActive)
);
</script>

<template>
    <div class="flex flex-col bg-zinc-900">
        <div v-if="activeDevice" class="flex items-center gap-2 p-4">
            <UIcon class="size-6" :name="iconsByType[activeDevice.type]" />

            <div class="flex flex-col">
                <p>Current device</p>

                <p class="flex items-center gap-1">
                    <UIcon class="size-4" name="i-mi-volume-up" />

                    {{ activeDevice.name }}
                </p>
            </div>
        </div>

        <p class="mb-2">Select another device</p>

        <ul>
            <li v-for="{ id, name, type, isActive } of availableDevices">
                <button
                    :key="id"
                    :disabled="isActive"
                    class="flex gap-2 items-center text-left p-4 cursor-pointer w-full rounded-md hover:bg-indigo-500 hover:active: transition-colors"
                    @click="$emit('select', id)"
                >
                    <UIcon class="size-6" :name="iconsByType[type]" />

                    <span>{{ name }}</span>
                </button>
            </li>
        </ul>
    </div>
</template>

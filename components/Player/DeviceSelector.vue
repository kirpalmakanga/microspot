<script setup lang="ts">
const iconsByType: Record<string, string> = {
    computer: 'i-mi-computer',
    smartphone: 'i-mi-mobile',
    speaker: 'i-mi-speakers'
};

const { data: devices, error, isPending, isLoading, refetch } = useAvailableDevices();

const { mutate: setActiveDevice, isLoading: isSavingDevice } = useSetActiveDevice();

const activeDevice = computed(() => devices.value?.find(({ isActive }) => isActive));

const availableDevices = computed(() => devices.value?.filter(({ isActive }) => !isActive));
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

        <div
            v-if="isPending || (error && isLoading)"
            class="bg-zinc-700 flex h-14 gap-2 rounded-md p-4 items-center"
        >
            <USkeleton class="size-6" />

            <USkeleton class="h-6 grow" />
        </div>

        <Error v-else-if="error" @action="refetch()" />

        <ul v-else-if="availableDevices">
            <li v-for="{ id, name, type } of availableDevices" :key="id">
                <button
                    :disabled="isSavingDevice"
                    class="flex gap-2 items-center text-left p-4 cursor-pointer w-full rounded-md hover:bg-indigo-500 hover:active:scale-95 transition-transform"
                    @click="setActiveDevice(id)"
                >
                    <UIcon class="size-6" :name="iconsByType[type]" />

                    <span>{{ name }}</span>
                </button>
            </li>
        </ul>
    </div>
</template>

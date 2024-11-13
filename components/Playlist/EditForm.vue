<script setup lang="ts">
const props = defineProps<{
    cover: string;
    name: string;
    description: string;
}>();

const { updatePlaylist } = usePlaylistStore();

const isOpen = defineModel<boolean>('isOpen');

const emit = defineEmits<{ close: [e: void]; submit: [e: void] }>();

const formData = reactive<{ name: string; description: string; cover: string }>(
    {
        name: props.name,
        description: props.description,
        cover: props.cover
    }
);

async function openFilePicker() {
    const file = await pickFile('image/jpeg,image/png');

    formData.cover = await getDataUrl(file);
}

function handleSubmit() {
    if (
        formData.name !== props.name ||
        formData.description !== props.description ||
        formData.cover !== props.cover
    ) {
        updatePlaylist(omit(formData, 'cover'), formData.cover);
    }

    isOpen.value = false;
}
</script>

<template>
    <UModal v-model:open="isOpen" title="Edit details" @close="$emit('close')">
        <template #body>
            <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
                <div class="flex gap-4">
                    <div class="group relative">
                        <Img
                            class="size-48 flex-shrink-0 bg-zinc-700 rounded-md"
                            :src="formData.cover"
                        />

                        <button
                            class="absolute inset-0 flex items-center justify-center bg-zinc-900/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity cursor-pointer"
                            type="button"
                            @click="openFilePicker"
                        >
                            <UIcon class="size-12" name="i-mi-edit" />
                        </button>
                    </div>

                    <div class="flex flex-col gap-4 grow">
                        <UInput
                            variant="soft"
                            size="xl"
                            type="text"
                            placeholder="Add a name"
                            v-model="formData.name"
                        />

                        <UTextarea
                            variant="soft"
                            class="grow"
                            :ui="{ base: ['h-full'] }"
                            type="textarea"
                            placeholder="Add a description"
                            v-model="formData.description"
                        />
                    </div>
                </div>

                <UButton
                    class="self-end cursor-pointer hover:scale-110 hover:active:scale-90 transition-transform"
                    type="submit"
                >
                    Save
                </UButton>
            </form>
        </template>
    </UModal>
</template>

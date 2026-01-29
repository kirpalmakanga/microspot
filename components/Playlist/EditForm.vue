<script setup lang="ts">
const props = defineProps<{
    playlistId: string;
    name: string;
    description: string;
    cover?: string;
}>();

const emit = defineEmits<{ saved: [e: void] }>();

function getInitialFormData() {
    return pick(props, 'name', 'description', 'cover');
}

const { mutate } = useUpdatePlaylist(props.playlistId);

const formData = reactive<{
    name: string;
    description: string;
    cover?: string;
}>(getInitialFormData());

async function openFilePicker() {
    const file = await pickFile('image/jpeg');

    formData.cover = await getDataUrl(file);
}

async function handleSubmit() {
    if (!isEqual(formData, getInitialFormData())) {
        mutate(formData);
    }

    emit('saved');
}
</script>

<template>
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex gap-4">
            <div class="group relative">
                <Img class="size-48 flex-shrink-0 bg-zinc-700 rounded-md" :src="formData.cover" />

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
                    :ui="{ base: 'h-full' }"
                    type="textarea"
                    placeholder="Add a description"
                    v-model="formData.description"
                />
            </div>
        </div>

        <UButton
            class="self-end cursor-pointer hover:scale-110 :hover:active:scale-90 transition-transform"
            type="submit"
        >
            Save
        </UButton>
    </form>
</template>

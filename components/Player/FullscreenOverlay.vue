<script setup lang="ts">
defineProps<{ cover: string; title: string; artists: Artist[] }>();
</script>

<template>
    <div class="grow flex justify-center items-center bg-zinc-800">
        <div class="flex gap-8 items-end">
            <Img class="size-96" :src="cover" />

            <div>
                <p class="text-32">
                    {{ title }}
                </p>

                <p class="opacity-60">
                    <template
                        :class="class"
                        v-for="({ id, name }, index) of artists"
                        :key="id"
                    >
                        <template v-if="index > 0">
                            {{ ', ' }}
                        </template>

                        {{ name }}
                    </template>
                </p>
            </div>
        </div>
    </div>
</template>

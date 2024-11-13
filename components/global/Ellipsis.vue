<script setup lang="ts">
const wrapper = useTemplateRef<HTMLSpanElement>('wrapper');

defineProps<{ toolTip?: string }>();
</script>

<template>
    <span
        ref="wrapper"
        class="block overflow-hidden overflow-ellipsis whitespace-nowrap"
        :class="{
            'after:(content-[attr(data-tooltip)] block fixed bg-black p-4 top-24 max-w-2/3 rounded-lg shadow-md opacity-0 invisible transition-opacity whitespace-normal) hover:after:(opacity-100 visible)':
                !!toolTip
        }"
        :data-tooltip="toolTip"
    >
        <slot />
    </span>
</template>

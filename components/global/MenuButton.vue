<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

defineProps<{ menuOptions: DropdownMenuItem[] }>();

const menuConfig = {
    align: 'start',
    side: 'bottom'
};
</script>

<template>
    <UDropdownMenu :items="menuOptions" :content="menuConfig">
        <button
            class="size-8 hover:scale-110 hover:active:scale-90 transition-transform transform cursor-pointer"
        >
            <UIcon class="size-full" name="i-mi-options-horizontal" />
        </button>
    </UDropdownMenu>
</template>

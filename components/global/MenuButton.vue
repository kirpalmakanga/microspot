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
        <IconButton class="size-8" icon="i-mi-options-horizontal" />
    </UDropdownMenu>
</template>

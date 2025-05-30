<script setup lang="ts">
import type { DropdownMenuItem, DropdownMenuProps } from '@nuxt/ui';

defineProps<{ menuOptions: DropdownMenuItem[] }>();

const menuConfig: DropdownMenuProps['content'] = {
    align: 'start',
    side: 'bottom'
};
</script>

<template>
    <UDropdownMenu :items="menuOptions" :content="menuConfig">
        <IconButton class="size-8" icon="i-mi-options-horizontal" />
    </UDropdownMenu>
</template>

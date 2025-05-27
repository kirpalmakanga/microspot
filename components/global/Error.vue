<script setup lang="ts">
defineEmits<{ action: [e: void] }>();
</script>

<template>
    <Placeholder
        icon="i-mi:circle-warning"
        text="An error has occured. Please check your connection and reload."
    >
        <UButton
            class="hover:scale-110 hover:active:scale-90 transition-transform mt-4"
            type="button"
            @click="$emit('action')"
        >
            Reload
        </UButton>
    </Placeholder>
</template>

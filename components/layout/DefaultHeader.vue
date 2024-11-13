<template>
    <LayoutHeader>
        <template v-slot:nav-left>
            <BackButton />
        </template>

        <template #nav-right>
            <nav class="flex">
                <NuxtLink
                    class="w-12 h-12 flex items-center justify-center"
                    to="/search"
                >
                    <UIcon class="size-6" name="i-mi-search" />
                </NuxtLink>
            </nav>
        </template>
    </LayoutHeader>
</template>

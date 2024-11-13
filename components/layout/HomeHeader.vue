<template>
    <LayoutHeader title="Dashboard">
        <template #nav-right>
            <nav class="flex">
                <NuxtLink
                    class="size-12 flex items-center justify-center"
                    to="/search"
                >
                    <UIcon class="size-6" name="i-mi-search" />
                </NuxtLink>
            </nav>
        </template>
    </LayoutHeader>
</template>

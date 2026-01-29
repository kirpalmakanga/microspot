<script setup lang="ts">
const route = useRoute();

const tabs = computed<{ title: string; href: string }[]>(() => {
    const basePath = `/search/${encodeURIComponent(route.params.query as string)}`;

    return [
        {
            title: 'All',
            href: basePath
        },
        {
            title: 'Artists',
            href: `${basePath}/artists`
        },
        {
            title: 'Albums',
            href: `${basePath}/albums`
        },
        {
            title: 'Tracks',
            href: `${basePath}/tracks`
        },
        {
            title: 'Playlists',
            href: `${basePath}/playlists`
        }
    ];
});
</script>

<template>
    <nav>
        <ul class="flex gap-2 p-4">
            <li v-for="{ title, href } of tabs" :key="href">
                <UButton
                    color="neutral"
                    :to="href"
                    class="hover:scale-110 hover:active:scale-90 transition"
                    :class="{
                        'opacity-50': href === route.fullPath
                    }"
                    :disabled="href === route.fullPath"
                >
                    {{ title }}
                </UButton>
            </li>
        </ul>
    </nav>
</template>

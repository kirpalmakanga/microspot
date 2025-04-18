<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

defineProps<{ title?: string }>();

const router = useRouter();

const authStore = useAuthStore();
const { isLoggedIn, userId, profilePicture } = storeToRefs(authStore);
const { logOut } = authStore;

const menuConfig = {
    align: 'end',
    side: 'bottom'
};

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-user',
        label: 'Profile',
        class: 'cursor-pointer',
        href: `/user/${userId.value}`
    },
    // {
    //     icon: 'i-mi-settings',
    //     label: 'Settings',
    //     class: 'cursor-pointer',
    //     href: '/settings'
    // },
    {
        type: 'separator'
    },
    {
        icon: 'i-mi-log-out',
        label: 'Log out',
        class: 'cursor-pointer',
        color: 'error',
        onSelect: () => {
            logOut();

            router.push('/login');
        }
    }
];
</script>

<template>
    <header class="flex items-center justify-between h-12 bg-zinc-900 shadow">
        <template v-if="isLoggedIn">
            <NuxtLink
                class="flex items-center justify-center h-12 w-12 cursor-pointer"
                to="/"
            >
                <UIcon class="size-6" name="i-mi-home" />
            </NuxtLink>

            <SearchForm />
        </template>

        <div v-else class="px-2 font-bold">MicroSpot</div>

        <div v-if="isLoggedIn" class="relative flex mx-2">
            <UDropdownMenu :content="menuConfig" :items="menuOptions">
                <button
                    class="hover:scale-110 hover:active:scale-90 transition-transform cursor-pointer"
                >
                    <UAvatar
                        color="neutral"
                        icon="i-mi-user"
                        :src="profilePicture"
                    />
                </button>
            </UDropdownMenu>
        </div>
    </header>
</template>

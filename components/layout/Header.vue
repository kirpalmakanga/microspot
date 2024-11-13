<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

defineProps<{ title?: string }>();

const router = useRouter();

const authStore = useAuthStore();
const { isLoggedIn, userId, profilePicture } = storeToRefs(authStore);
const { logOut } = authStore;

const menuOptions: DropdownMenuItem[] = [
    {
        icon: 'i-mi-user',
        label: 'Profile',
        class: 'cursor-pointer',
        href: `/user/${userId.value}`
    },
    {
        icon: 'i-mi-settings',
        label: 'Settings',
        class: 'cursor-pointer',
        href: '/settings'
    },
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
        <slot name="nav-left"></slot>

        <div class="flex items-center grow">
            <h1
                v-if="title"
                class="px-4 text-xl font-secondary overflow-hidden"
            >
                <span
                    class="overflow-ellipsis overflow-hidden whitespace-nowrap"
                >
                    {{ title }}
                </span>
            </h1>

            <slot></slot>
        </div>

        <slot name="nav-right"></slot>

        <div v-if="isLoggedIn" class="relative flex mx-2">
            <UDropdownMenu
                class="w-48"
                :items="menuOptions"
                :content="{
                    align: 'end',
                    side: 'bottom',
                    sideOffset: 8
                }"
            >
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

<template>
    <ul
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4"
    >
        <li>
            <div
                class="flex flex-col bg-zinc-600 hover:bg-zinc-500 shadow transition-colors p-4 rounded-md group cursor-pointer"
            >
                <div class="relative bg-zinc-700 rounded-md overflow-hidden">
                    <USkeleton class="aspect-square h-full" />
                </div>

                <div
                    class="flex flex-col grow justify-end overflow-hidden mt-4"
                >
                    <USkeleton class="h-4 w-full" />

                    <USkeleton class="h-3.5 w-1/2 opacity-60 mt-2" />
                </div>
            </div>
        </li>
    </ul>
</template>

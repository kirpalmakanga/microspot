<template>
    <article class="flex items-center group bg-zinc-600 h-[60px]">
        <button
            class="flex items-center justify-center size-10 p-2 hover:opacity-80 cursor-pointer"
        >
            <USkeleton class="size-5" />
        </button>

        <USkeleton class="size-12" />

        <div class="flex flex-col grow gap-1 p-2">
            <USkeleton class="h-4 w-full" />

            <div class="flex items-center gap-2">
                <USkeleton class="h-4 w-48" />
            </div>
        </div>

        <div class="text-sm mx-10"><USkeleton class="h-4 w-9" /></div>
    </article>
</template>

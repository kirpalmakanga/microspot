<template>
    <div class="flex items-end bg-zinc-500 p-4 gap-4">
        <div class="rounded-md flex-shrink-0">
            <USkeleton class="size-48" />
        </div>

        <div class="flex flex-col gap-2">
            <p><USkeleton class="h-4 w-48" /></p>

            <h1 class="text-4xl font-secondary">
                <USkeleton class="h-10 w-60" />
            </h1>

            <p><USkeleton class="h-4 w-24" /></p>
        </div>
    </div>
</template>

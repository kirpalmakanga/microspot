export function useAppTitle(title?: string | Ref<string>) {
    useHead({
        title: computed(() => {
            const unwrapped = unref(title);

            return `${unwrapped ? `${unwrapped} | ` : ''}MicroSpot`;
        })
    });
}

export function useAppTitle(title?: string | Ref<string>) {
    useHead({
        title: computed(() => {
            const unwrapped = toValue(title);

            return `${unwrapped ? `${unwrapped} | ` : ''}MicroSpot`;
        })
    });
}

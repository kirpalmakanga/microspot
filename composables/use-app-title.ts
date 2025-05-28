export function useAppTitle(
    title?: MaybeRef<string> | undefined | ComputedRef<string | undefined>
) {
    useHead({
        title: computed(() => {
            const unwrapped = toValue(title);

            return `${unwrapped ? `${unwrapped} | ` : ''}MicroSpot`;
        })
    });
}

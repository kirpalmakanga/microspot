import { useClipboard } from '@vueuse/core';

export function useCopy() {
    const toast = useToast();
    const { copy } = useClipboard();

    return (text: string) => {
        copy(text);

        toast.add({ title: 'Copied to clipboard.' });
    };
}

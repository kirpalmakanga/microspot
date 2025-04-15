export const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
            } else {
                const js = document.createElement('script');

                document.body.appendChild(js);

                js.src = src;
                js.onload = () => resolve();
            }
        } catch (err) {
            reject(err);
        }
    });
};

export const formatTime = (t: number) => {
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t - hours * 3600) / 60);
    const seconds = Math.floor(t - (hours * 3600 + minutes * 60));

    const units = [minutes, seconds];

    if (hours) {
        units.unshift(hours);
    }

    return units.map((unit) => `${unit}`.padStart(2, '0')).join(':');
};

export function uniqueByKey<T extends object, K extends keyof T>(
    arr: T[],
    key: K
) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
}

export function isNumber(value: unknown) {
    return typeof value === 'number';
}

export function omit<T extends object, K extends keyof T>(
    base: T,
    ...keys: K[]
): Omit<T, K> {
    if (keys.length) {
        const result = { ...base };

        for (const key of keys) delete result[key];

        return result;
    }

    return base;
}

export function pickFile(accept?: string): Promise<File> {
    const input = document.createElement('input');
    let isResolving = false;
    input.style.display = 'none';
    input.type = 'file';

    if (accept) {
        input.accept = accept;
    }

    return new Promise((resolve, reject) => {
        function handleCleanup() {
            setTimeout(() => {
                if (document.body.contains(input)) {
                    document.body.removeChild(input);
                }

                if (!isResolving) {
                    reject(new Error('Cancelled'));
                }
            }, 500);
        }

        input.addEventListener(
            'change',
            () => {
                if (input.files) {
                    isResolving = true;

                    resolve(input.files[0]);
                }

                handleCleanup();
            },
            {
                once: true
            }
        );

        window.addEventListener('focus', handleCleanup, {
            once: true
        });

        document.body.appendChild(input);

        input.click();
    });
}

export function getDataUrl(file: File): Promise<string> {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);

        reader.onerror = (error) => reject(error);
    });
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}

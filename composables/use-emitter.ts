import mitt from 'mitt';

type Events = {
    togglePlay: undefined;
    launch: { contextUri: string; trackUri?: string; position?: number };
};

const emitter = mitt<Events>();

export function useEmitter() {
    const subscriptions = new Map<string, Function>();

    function on<K extends keyof Events>(event: K, callback: (payload: Events[K]) => void) {
        if (subscriptions.has(event)) {
            console.warn(`Event ${event} already has a subscription for this component.`);
        } else {
            emitter.on(event, callback);

            subscriptions.set(event, () => emitter.off(event, callback));
        }
    }

    function off<K extends keyof Events>(event: K) {
        const unsubscribe = subscriptions.get(event);

        if (unsubscribe) {
            unsubscribe();

            subscriptions.delete(event);
        } else {
            console.warn(`No subscription found for event ${event} for this component.`);
        }
    }

    function unsubscribeAll() {
        for (const unsubscribe of subscriptions.values()) {
            unsubscribe();
        }

        subscriptions.clear();
    }

    onBeforeUnmount(unsubscribeAll);

    return { on, off, emit: emitter.emit };
}

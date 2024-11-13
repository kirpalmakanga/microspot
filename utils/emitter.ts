import mitt from 'mitt';

type Events = {
    togglePlay: undefined;
    launch: { contextUri: string; trackUri?: string; position?: number };
};

export const emitter = mitt<Events>();

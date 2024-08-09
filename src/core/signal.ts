type SignalUnsubscriber = () => void;
export type Signal<EventMap extends Record<string, any> = any> = {
    on: (
        event: keyof EventMap,
        callback: CallableFunction
    ) => SignalUnsubscriber;
    once: (
        event: keyof EventMap,
        callback: CallableFunction
    ) => SignalUnsubscriber;
    off: (event: keyof EventMap, callback?: CallableFunction) => void;
    clear: () => void;
    emit: (event: keyof EventMap, ...extra_options: any[]) => void;
};

export const createSignal = <
    EventMap extends Record<string, any>,
>(): Signal<EventMap> => {
    const events = new Map<keyof EventMap, CallableFunction[]>();
    const signal: Signal<EventMap> = {
        on: (event, callback) => {
            const list = events.get(event) ?? [];
            list.push(callback);
            events.set(event, list);

            return () => signal.off(event, callback);
        },

        once: (event, callback) => {
            const unsub = signal.on(event, () => {
                callback();
                unsub();
            });

            return unsub;
        },

        emit: (event, ...extra_options: any[]) => {
            const callbacks = assert(events.get(event));
            callbacks.forEach((cb) => {
                cb(...extra_options);
            });
        },

        off: (event, callback = undefined) => {
            if (callback === undefined) {
                events.set(event, []);
            } else {
                const list = events.get(event) ?? [];
                events.set(
                    event,
                    list.filter((cb) => cb !== callback)
                );
            }
        },
        clear: () => {
            events.clear();
        },
    };

    return signal;
};

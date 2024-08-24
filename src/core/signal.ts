type SignalUnsubscriber = () => void;

export type Signal<EventName extends string, CallbackOptions extends any[] = any[]> = {
  on: (event: EventName, callback: (...args: CallbackOptions) => any) => SignalUnsubscriber;
  once: (event: EventName, callback: (...args: CallbackOptions) => any) => SignalUnsubscriber;
  off: (event: EventName, callback?: (...args: CallbackOptions) => any) => void;
  clear: () => void;
  emit: (event: EventName, ...extra_options: any[]) => void;
};
export const create_signal = <EventName extends string, CallbackOptions extends any[] = any[]>(eventname: EventName): Signal<EventName, CallbackOptions> => {
  let listeners: CallableFunction[] = [];
  const signal: Signal<EventName> = {
    on: (event, callback) => {
      listeners.push(callback);

      return () => signal.off(event, callback);
    },

    once: (event, callback) => {
      const unsub = signal.on(event, () => {
        callback();
        unsub();
      });

      return unsub;
    },

    emit: (event, ...extra_options: CallbackOptions) => {
      listeners.forEach((cb) => {
        cb(...extra_options);
      });
    },

    off: (event, callback = undefined) => {
      if (callback === undefined) {
        listeners = [];
      } else {
        listeners = listeners.filter((cb) => cb !== callback);
      }
    },
    clear: () => {
      listeners = [];
    },
  };

  return signal;
};

type SignalUnsubscriber = () => void;

export type Signal<EventName extends string> = {
  on: (event: EventName, callback: CallableFunction) => SignalUnsubscriber;
  once: (event: EventName, callback: CallableFunction) => SignalUnsubscriber;
  off: (event: EventName, callback?: CallableFunction) => void;
  clear: () => void;
  emit: (event: EventName, ...extra_options: any[]) => void;
};

export const create_signal = <EventName extends string>(eventname: EventName): Signal<EventName> => {
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

    emit: (event, ...extra_options: any[]) => {
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

type SignalUnsubscriber = () => void;

export type Signal<EventDetail extends any = any> = {
  subscribe: (callback: (detail: EventDetail) => any) => SignalUnsubscriber;
  once: (callback: (detail: EventDetail) => any) => SignalUnsubscriber;
  unsubscribe: (callback?: (detail: EventDetail) => any) => void;
  clear: () => void;
  emit: (detail: EventDetail) => void;
};
export const create_signal = <EventDetail extends any = any>(): Signal<EventDetail> => {
  let listeners: CallableFunction[] = [];
  const signal: Signal<EventDetail> = {
    subscribe: (callback) => {
      listeners.push(callback);

      return () => signal.unsubscribe(callback);
    },

    once: (callback) => {
      const unsub = signal.subscribe((detail) => {
        callback(detail);
        unsub();
      });

      return unsub;
    },

    emit: (detail) => {
      listeners.forEach((cb) => {
        cb(detail);
      });
    },

    unsubscribe: (callback = undefined) => {
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

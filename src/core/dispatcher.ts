type Unsubscriber = () => void;

export type EventDispatcher<
  EventMap extends Record<string, any> = any,
  CallbackReturnMap extends Record<keyof EventMap, any | void> = any,
> = {
  on: <EventName extends keyof EventMap>(
    event: EventName,
    callback: (detail: EventMap[EventName]) => CallbackReturnMap[EventName]
  ) => Unsubscriber;
  once: <EventName extends keyof EventMap>(
    event: EventName,
    callback: (detail: EventMap[EventName]) => CallbackReturnMap[EventName]
  ) => Unsubscriber;
  off: <EventName extends keyof EventMap>(
    event: EventName,
    callback?: (detail: EventMap[EventName]) => CallbackReturnMap[EventName]
  ) => void;
  emit: <EventName extends keyof EventMap>(event: EventName, detail?: EventMap[EventName]) => void;
  clear: () => void;
};

export const create_event_dispatcher = <
  EventMap extends Record<string, any>,
  CallbackReturnMap extends Record<keyof EventMap, any> = any,
>(): EventDispatcher<EventMap, CallbackReturnMap> => {
  const events = new Map<keyof EventMap, CallableFunction[]>();
  const signal: EventDispatcher<EventMap> = {
    on: (event, callback) => {
      const list = events.get(event) ?? [];
      list.push(callback);
      events.set(event, list);

      return () => signal.off(event, callback);
    },

    once: (event, callback) => {
      const unsub = signal.on(event, (detail: EventMap[typeof event]) => {
        unsub();
        callback(detail);
      });

      return unsub;
    },

    emit: (event, detail?: EventMap[typeof event]) => {
      const callbacks = events.get(event) ?? [];
      callbacks.forEach((cb) => {
        cb(detail);
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

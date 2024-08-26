import type { Readable, StartStopNotifier, Subscriber, Unsubscriber, Writable, StoresValues } from "./store-types";

export type { Readable, Writable, Subscriber, Unsubscriber, StoresValues };

const noop: () => void = () => {};

export const create_writable = <T>(initial_value: T, start?: StartStopNotifier<T>): Writable<T> => {
  const subscribers = new Set<Subscriber<T>>();
  let inner_value: T = initial_value;
  let has_subscribers = false;
  let stop: (() => any) | undefined = undefined;

  const set = (value: T) => {
    if (value !== inner_value) {
      inner_value = value;
      if (has_subscribers && stop !== undefined) {
        subscribers.forEach((notify) => {
          notify(inner_value);
        });
      }
    }
  };

  const update = (fn: (old_value: T) => T) => {
    set(fn(inner_value));
  };

  const subscribe = (callback: Subscriber<T>): Unsubscriber => {
    subscribers.add(callback);

    has_subscribers = subscribers.size > 0;

    if (subscribers.size === 1) {
      if (start !== undefined) {
        stop = start(set, update) ?? noop;
      }
    }

    callback(inner_value);

    return () => {
      subscribers.delete(callback);

      if (subscribers.size === 0 && stop) {
        has_subscribers = false;
        if (stop !== undefined) {
          stop();
          stop = undefined;
        }
      }
    };
  };

  return {
    set,
    update,
    get: () => inner_value,
    subscribe,
  };
};

export const create_readable = <T>(initial_value: T, start: StartStopNotifier<T>): Readable<T> => {
  const inner = create_writable(initial_value, start);

  return {
    get: inner.get,
    subscribe: inner.subscribe,
  };
};

export const create_readonly = <T>(store: Readable<T> | Writable<T>): Readable<T> => {
  return {
    get: store.get,
    subscribe: store.subscribe,
  };
};

export const create_derived = <S extends [Readable<any>, ...Array<Readable<any>>], T>(
  stores: S,
  fn: (values: StoresValues<S>) => T,
  initial_value?: T
): Readable<T> => {
  const get = (): T => fn(stores.map((store) => store.get()) as StoresValues<typeof stores>);
  let inner_value: T = initial_value ?? get();
  return create_readable(inner_value, (set) => {
    const unsubscribes: Unsubscriber[] = stores.map((store, i) =>
      store.subscribe(() => {
        set(get());
      })
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  });
};

const tapped_stores = new Map<Readable<any>, Unsubscriber>();

/**
 * Add a subscriber to one or many stores.
 * Primarily for readable stores as this will initiate / "start" them
 * @param store
 */
export const tap = (...stores: Readable<any>[]) => {
  stores.forEach((store) => {
    if (!tapped_stores.has(store)) {
      const unsub = store.subscribe(() => {});
      tapped_stores.set(store, unsub);
    }
  });
};

export const untap = (...stores: Readable<any>[]) => {
  stores.forEach((store) => {
    if (tapped_stores.has(store)) {
      const unsub = tapped_stores.get(store)!;
      unsub();
      tapped_stores.delete(store);
    }
  });
};

export const untap_all = () => {
  tapped_stores.forEach((unsub, store) => {
    unsub();
  });
  tapped_stores.clear();
};

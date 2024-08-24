import { ECS } from "../../ecs";
import { create_signal } from "../signal";
import type { Milliseconds, Seconds } from "../types";

export type GameTimer = {
  update: (dt: Milliseconds) => void;
  wait: (time: Milliseconds) => Promise<void>;
  get_ticks: () => number;
  get_elapsed: () => Seconds;
  create_throttle: <CallbackResult = any, CallbackArgs extends Array<any> = any[]>(
    time: Seconds,
    callback: (...args: CallbackArgs) => CallbackResult
  ) => (...args: CallbackArgs) => readonly [boolean, CallbackResult] | readonly [boolean];
  create_interval: (period: Seconds, callback: Function) => () => void;
};

// This many ticks will trigger for _less_ low-level timer checks
const SAFE_TICK_COUNT = 3;

let elapsed_time: Seconds = 0;

let ticks = 0;
const signal = create_signal<"safe-tick", [elapsed: number, delta: number]>("safe-tick");

export const GameTime: GameTimer = {
  get_elapsed: () => elapsed_time,
  get_ticks: () => ticks,
  update(dt) {
    ticks += 1;
    elapsed_time += dt;

    const items = ECS.query("gametime");
    items.forEach((item) => item.gametime.update(elapsed_time, dt));

    if (ticks % SAFE_TICK_COUNT === 0) {
      signal.emit("safe-tick", elapsed_time, dt);
    }
  },

  wait: async (time) => {
    const seconds = time / 1000;
    const start = elapsed_time;
    const target = start + seconds;

    if (target <= start) {
      return Promise.resolve();
    }

    await new Promise<void>((resolve) => {
      const unsub = signal.on("safe-tick", (elapsed, delta) => {
        if (elapsed >= target) {
          unsub();
          resolve();
        }
      });
    });
  },

  create_throttle: <CallbackResult = any, CallbackArgs extends Array<any> = any[]>(
    time: Seconds,
    callback: (...args: CallbackArgs) => CallbackResult
  ) => {
    let next_call = elapsed_time + time;

    const execute = (
      ...args: CallbackArgs
    ): readonly [executed: boolean, result: CallbackResult] | [executed: false] => {
      if (elapsed_time >= next_call) {
        next_call = elapsed_time + time;
        return [true, callback(...args)];
      } else return [false];
    };

    return execute;
  },

  create_interval: (period, callback) => {
    const start = elapsed_time;
    let next = start + period;

    const unsub = signal.on("safe-tick", (elapsed, delta) => {
      if (elapsed_time >= next) {
        next = elapsed_time + period;
        callback();
      }
    });

    return () => unsub();
  },
};

export const clear_intervals = () => {
  signal.clear();
};

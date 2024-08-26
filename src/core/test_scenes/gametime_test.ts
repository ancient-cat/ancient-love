import console from "../console";
import { Unsubscriber } from "../observable/store-types";
import { Scenes } from "../scene";
import { GameTime } from "../systems/gametime";

export default Scenes.create(() => {
  let last_interval_msg: string = "Not executed yet";
  let last_throttle_msg: string = `Not executed yet`;

  const throttled_time = GameTime.create_throttle(2, (time: number) => {
    last_throttle_msg = `Throttle was executed at ${time}`;
    console.log(last_throttle_msg);
    return last_throttle_msg;
  });

  let stop_interval: Unsubscriber;

  return {
    name: "timer test",
    state: undefined,
    update: (dt) => {
      throttled_time(GameTime.get_elapsed());
    },

    enter: () => {
      stop_interval = GameTime.create_interval(2, () => {
        last_interval_msg = `Interval called at ${GameTime.get_elapsed()}`;
      });
    },

    exit: () => {
      stop_interval();
    },

    draw: () => {
      const current_time = GameTime.get_elapsed();
      love.graphics.setBackgroundColor(0, 0, 0);
      love.graphics.setColor(0.5, 0.7, 1);
      love.graphics.print(`GameTime.create_throttle: Called fn at ${current_time}`, 100, 85);
      love.graphics.print(`GameTime.create_throttle: ${last_throttle_msg}`, 100, 100);

      love.graphics.print(`GameTime.create_interval: ${last_interval_msg}`, 100, 130);
    },
  };
});

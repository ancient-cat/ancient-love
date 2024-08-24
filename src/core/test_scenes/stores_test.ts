import { Scenes } from "../scene";
import { create_writable, create_derived, create_readable, Readable, Unsubscriber } from "../observable/stores";
import console from "../console";
import { GameTime } from "../systems/gametime";

export default Scenes.create(() => {
  const first_name = create_writable("");
  const last_name = create_writable("");

  const full_name = create_derived([first_name, last_name], ([first, last]) => {
    return `${first} ${last}`;
  });

  const timer = create_readable(0, (set, update) => {
    return GameTime.create_interval(1, () => update((v) => v + 1));
  });

  const state: Readable<{ first: string; last: string; time: number }> = create_derived(
    [first_name, last_name, timer],
    ([first, last, time]) => {
      return {
        first,
        last,
        time,
      };
    }
  );

  let stop_timer: Unsubscriber;

  return {
    name: "stores_test",
    state: state.get(),
    stores: [timer, full_name],
    enter: () => {
      first_name.set("Dog");
      last_name.set("Rancho");
      stop_timer = timer.subscribe((v) => console.log(`${v} seconds elapsed`));
    },
    exit: () => {
      stop_timer();
    },
    update: (dt) => {},
    draw() {
      love.graphics.setBackgroundColor(0.3, 0.1, 0.1);
      love.graphics.setColor(0.2, 0.8, 0.7);

      love.graphics.print(full_name.get(), 100, 100);
      love.graphics.print(`${timer.get()} seconds since game started`, 100, 120);
    },
  };
});

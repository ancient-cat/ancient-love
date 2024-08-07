import console from "../core/console";
import { Scenes } from "../core/scene";
import { GameTime } from "../core/timer";

let last_pressed: string | null = null;

const console_test = Scenes.create({
  name: "Console Test",

  enter: () => {
    console.log("hello", { test: "test", dog: { bark: function () {} } }, [1, 2, 3]);
    console.log(null, 1, true, false);
  },

  keypress: async (key: string) => {
    last_pressed = key;

    await GameTime.wait(1000);
    last_pressed = null;
  },

  update(dt) {},

  draw() {
    love.graphics.print("Type something", 400, 300);

    if (last_pressed != null) {
      love.graphics.print(last_pressed, 400, 400);
    }
  },
});

export default console_test;

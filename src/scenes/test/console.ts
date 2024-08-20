import console from "../../core/console";
import { create_event_dispatcher } from "../../core/dispatcher";
import { Scenes } from "../../core/scene";
import { GameTime } from "../../core/systems/timer";

let last_pressed: string | null = null;

const events = create_event_dispatcher();

const console_test = Scenes.create({
  name: "Console Test",

  enter: () => {
    console.log("hello", { test: "test", dog: { bark: function () {} } }, [1, 2, 3]);
    console.log(null, 1, true, false);

    events.on("keypress", (last_pressed: string) => {
      console.log("bonk", last_pressed);
    });

    events.on("cleared", () => {
      console.log("last_pressed cleared");
    });

    events.once("letter:k", () => {
      console.log("LETTER K WAS PRESSED");
    });
  },

  keypress: async (key: string) => {
    last_pressed = key;
    events.emit("keypress", last_pressed);

    if (last_pressed === "k") {
      events.emit("letter:k");
    }

    await GameTime.wait(1000);
    last_pressed = null;
    events.emit("cleared");
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

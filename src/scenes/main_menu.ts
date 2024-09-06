import { ColorType } from "../core/color";
import console from "../core/console";
import { Scenes } from "../core/scene";
import { create_ui } from "../core/ui";
import { Button } from "../core/ui/types";
import { game_events } from "../game";

const main_menu = Scenes.create(() => {
  const [w, h] = love.graphics.getDimensions();
  const UI = create_ui();

  const menu_item_size = 200;
  UI.configure({
    root: {
      padding: {
        top: h / 4,
        bottom: h / 4,
        left: (w - menu_item_size) / 2,
        right: (w - menu_item_size) / 2,
      },
    },
  });

  const start_game_btn = UI.create_button({
    text: "Start Game",
    limit: 200,
    align: "center",
  });

  const options_btn = UI.create_button({
    text: "Options",
    limit: 200,
    align: "center",
  });

  const exit_game_btn = UI.create_button({
    text: "Exit",
    limit: 200,
    align: "center",
  });

  let cursor: number = 0;
  const menu_options: Button[] = [start_game_btn, options_btn, exit_game_btn];

  menu_options.forEach((btn) => {
    UI.add(btn);
  });

  const bg_color: ColorType = new ColorType(100, 40, 40);

  return {
    name: "Main Menu",
    state: undefined,
    enter: () => {
      start_game_btn.on("click", () => {
        game_events.emit("start");
      });

      options_btn.on("click", () => {
        // open options UI
      });

      exit_game_btn.on("click", () => {
        game_events.emit("quit");
      });
    },
    update(dt) {
      UI.update(dt);
    },

    keypressed(key, scancode, isrepeat) {
      if (key === "up") {
        cursor -= 1;
        if (cursor < 0) {
          cursor = menu_options.length - 1;
        }
      } else if (key === "down") {
        cursor += 1;
        if (cursor >= menu_options.length) {
          cursor = 0;
        }
      }

      menu_options.forEach((btn, i) => {
        if (i === cursor) {
          btn.active = true;
        } else {
          btn.active = false;
        }
      });

      if (key === "return") {
        const current_btn = menu_options.at(cursor);

        current_btn?.emit("click");
      }
    },

    draw() {
      love.graphics.setBackgroundColor(bg_color.rgb);
      UI.draw();
    },

    mousemoved(...args: Parameters<NonNullable<typeof love.mousemoved>>) {
      UI.mousemoved(...args);
    },

    mousepressed(...args: Parameters<NonNullable<typeof love.mousepressed>>) {
      UI.mousepressed(...args);
    },

    mousereleased(...args: Parameters<NonNullable<typeof love.mousereleased>>) {
      UI.mousereleased(...args);
    },
  };
});

export default main_menu;

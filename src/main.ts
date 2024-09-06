import { initialize } from "./core/framework";

import console from "./core/console";
import { Scenes } from "./core/scene";

import { game_events } from "./game";

import scene_test from "./core/test_scenes/scene_test";
import stores_test from "./core/test_scenes/stores_test";
import gametime_test from "./core/test_scenes/gametime_test";
import tween_test from "./core/test_scenes/tween_test";
import camera_test from "./core/test_scenes/camera_test";
import color_test from "./core/test_scenes/color_test";
import ui_test from "./core/test_scenes/ui_test";

import { GameTime } from "./core/systems/gametime";
import { flux } from "flux";
import main_menu from "./scenes/main_menu";

math.randomseed(os.clock());
love.load = (arg: string[]) => {
  Scenes.switch(main_menu);

  game_events.on("quit", () => {
    love.event.quit();
  });

  game_events.on("start", () => {
    console.log("Starting game...");
    // Start here
    // Scenes.switch(main_game);
  });
};

// Global Update things happen here
love.update = (dt: number) => {
  GameTime.update(dt);
  Scenes.update(dt);
  flux.update(dt);
};

love.keypressed = (key, scancode, isrepeat) => {
  if (key === "escape") {
    game_events.emit("quit");
  }
};

initialize();

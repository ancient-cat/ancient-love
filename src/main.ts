import { initialize } from "./core/framework";

import console from "./core/console";
import { Scenes } from "./core/scene";

import { game_events } from "./game";

import scene_test from "./core/test_scenes/scene_test";

// Setting love handlers before initialize will make it a "global" handler
// Global handlers will be called in-addition-to the Scene handlers
love.load = (arg: string[]) => {

  Scenes.switch(scene_test);

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
love.update = (dt: number) => {};

love.keypressed = (key, scancode, isrepeat) => {
  if (key === "escape") {
    game_events.emit("quit");
  }
};

initialize();

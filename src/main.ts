import { Scenes } from "./core/scene";

import console from "./core/console";
import { GameTime } from "./core/systems/timer";
import { game_events } from "./game";

import collisions_test from "./core/test_scenes/collisions";

import main_menu from "./scenes/main_menu";

love.load = () => {
  Scenes.switch(collisions_test);

  game_events.on("quit", () => {
    love.event.quit();
  });

  game_events.on("start", () => {
    console.log("Starting game...");
    // Start here
    // Scenes.switch(main_game);
  });
};

love.update = (dt: number) => {
  GameTime.update(dt);
  Scenes.update(dt);
};

love.keypressed = (key, scancode, isrepeat) => {
  Scenes.keypressed(key, scancode, isrepeat);

  if (key === "escape") {
    game_events.emit("quit");
  }
};

love.mousemoved = (x, y, dx, dy, istouch) => {
  Scenes.mousemoved(x, y, dx, dy, istouch);
};

love.draw = () => {
  Scenes.draw();
  love.graphics.setColor(1, 1, 0, 1);
};

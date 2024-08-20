import { Scenes } from "./core/scene";

import console from "./core/console";
import { GameTime } from "./core/systems/timer";

import collisions_test from "./scenes/test/collisions";

love.load = async () => {
  console.log("Loading !");
  Scenes.switch(collisions_test);
};

love.update = (dt: number) => {
  GameTime.update(dt);
  Scenes.update(dt);
};

love.keypressed = (key: string) => Scenes.keypress(key);

love.draw = () => {
  Scenes.draw();
  love.graphics.setColor(1, 1, 0, 1);
};

love.conf = (config) => {
  config.console = true;
};

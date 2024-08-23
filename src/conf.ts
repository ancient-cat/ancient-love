import type { Config } from "love";

love.conf = (config: Config) => {
  config.window.title = "New Game";
  config.console = true;
  config.window.resizable = true;
};

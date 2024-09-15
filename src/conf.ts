import type { Config } from "love";

love.conf = (config: Config) => {
  config.window.title = "New Game";
  // support the lua debugger
  config.console = false; // os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") == "1" ? false : true;
  config.window.resizable = true;
};

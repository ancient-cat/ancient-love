let old_load: NonNullable<typeof love.load>;
let old_update: NonNullable<typeof love.update>;

import { lurker, lume } from "packages";
import { GameTime } from "./systems/timer";
import { Scenes } from "./scene";
import console from "./console";

let hot_module_reload: boolean = false;

/** Initializes Scenes, scene handlers, and development mode features.
 * */
export const initialize = () => {
  old_load = love.load ?? (() => {});
  old_update = love.update ?? (() => {});
  let love_load_parms: {
    arg: string[];
    unfilteredArg: string[] | undefined;
  };

  love.load = (arg: string[], unfilteredArg?: string[]) => {
    love_load_parms = {
      arg,
      unfilteredArg,
    };

    hot_module_reload = arg.includes("--hmr");

    Scenes.init();
    old_load(arg, unfilteredArg);
  };

  if (hot_module_reload) {
    console.log("HMR detected");
    lurker.preswap = (f: string) => {
      if (f === "lualib_bundle.lua") return true;
      if (f === undefined) return true;
    };
    lurker.postswap = (file: string) => {
      if (love.load) {
        love.load(love_load_parms.arg, love_load_parms.unfilteredArg);
      }
    };
    love.update = (dt: number) => {
      GameTime.update(dt);
      Scenes.update(dt);
      old_update(dt);
      lurker.update();
    };
  } else {
    love.update = (dt: number) => {
      GameTime.update(dt);
      Scenes.update(dt);
      old_update(dt);
    };
  }

  const extend_existing_handler = (existing: CallableFunction | undefined, handler: CallableFunction) => {
    if (existing !== undefined) {
      return (...args: any[]) => {
        const a = existing(...args);
        const b = handler(...args);
        return a ?? b;
      };
    } else {
      return (...args: []) => handler(...args);
    }
  };

  love.draw = extend_existing_handler(love.draw, Scenes.draw);
  love.touchmoved = extend_existing_handler(love.touchmoved, Scenes.handlers.touchmoved);
  love.touchreleased = extend_existing_handler(love.touchreleased, Scenes.handlers.touchreleased);
  love.touchmoved = extend_existing_handler(love.touchmoved, Scenes.handlers.touchmoved);
  love.joystickpressed = extend_existing_handler(love.joystickpressed, Scenes.handlers.joystickpressed);
  love.joystickreleased = extend_existing_handler(love.joystickreleased, Scenes.handlers.joystickreleased);
  love.joystickaxis = extend_existing_handler(love.joystickaxis, Scenes.handlers.joystickaxis);
  love.joystickhat = extend_existing_handler(love.joystickhat, Scenes.handlers.joystickhat);
  love.gamepadpressed = extend_existing_handler(love.gamepadpressed, Scenes.handlers.gamepadpressed);
  love.gamepadreleased = extend_existing_handler(love.gamepadreleased, Scenes.handlers.gamepadreleased);
  love.gamepadaxis = extend_existing_handler(love.gamepadaxis, Scenes.handlers.gamepadaxis);
  love.joystickadded = extend_existing_handler(love.joystickadded, Scenes.handlers.joystickadded);
  love.joystickremoved = extend_existing_handler(love.joystickremoved, Scenes.handlers.joystickremoved);
  love.focus = extend_existing_handler(love.focus, Scenes.handlers.focus);
  love.resize = extend_existing_handler(love.resize, Scenes.handlers.resize);
  love.mousefocus = extend_existing_handler(love.mousefocus, Scenes.handlers.mousefocus);
  love.visible = extend_existing_handler(love.visible, Scenes.handlers.visible);
  love.lowmemory = extend_existing_handler(love.lowmemory, Scenes.handlers.lowmemory);
  love.keyreleased = extend_existing_handler(love.keyreleased, Scenes.handlers.keyreleased);
  love.textinput = extend_existing_handler(love.textinput, Scenes.handlers.textinput);
  love.filedropped = extend_existing_handler(love.filedropped, Scenes.handlers.filedropped);
  love.textedited = extend_existing_handler(love.textedited, Scenes.handlers.textedited);
  love.directorydropped = extend_existing_handler(love.directorydropped, Scenes.handlers.directorydropped);
  love.mousemoved = extend_existing_handler(love.mousemoved, Scenes.handlers.mousemoved);
  love.displayrotated = extend_existing_handler(love.displayrotated, Scenes.handlers.displayrotated);
  love.quit = extend_existing_handler(love.quit, Scenes.handlers.quit);
  love.mousepressed = extend_existing_handler(love.mousepressed, Scenes.handlers.mousepressed);
  love.mousereleased = extend_existing_handler(love.mousereleased, Scenes.handlers.mousereleased);
  love.wheelmoved = extend_existing_handler(love.wheelmoved, Scenes.handlers.wheelmoved);
  love.touchpressed = extend_existing_handler(love.touchpressed, Scenes.handlers.touchpressed);
};

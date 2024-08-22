import type { Handlers } from "love-typescript-definitions/typings/love/handlers";
import console from "./console";
import type { Config, event, LightUserData } from "love";
import type { File } from "love.filesystem";
import type { Joystick, GamepadAxis, GamepadButton, JoystickHat } from "love.joystick";
import type { KeyConstant, Scancode } from "love.keyboard";

import type { DisplayOrientation } from "love.window";

type SceneLoveHandles = Omit<Handlers, "draw" | "update" | "run" | "load" | "threaderror" | "errorhandler">;
type SceneManagerHandlers = Required<Omit<Handlers, "draw" | "update" | "run" | "load" | "threaderror" | "errorhandler">>;
type MaybePromise = Promise<void> | void;
export type Scene<T = undefined> = {
  name: string;
  state: T;
  update: (dt: number) => void;
  init?: () => MaybePromise;
  draw: () => void;
  enter?: (from?: Scene) => MaybePromise;
  exit?: () => MaybePromise;
} & SceneLoveHandles;

type SceneMode = {
  update: boolean;
  draw: boolean;
  handlers: boolean;
};

export type SceneManager = {
  current: () => Scene<any> | undefined;
  get_scenes: () => readonly Scene<any>[];
  create: <T>(scene_init: Scene<T>) => Scene<T>;
  switch: (scene: Scene<any>) => Promise<Scene<any>>;
  push: (scene: Scene<any>, mode?: Partial<SceneMode>) => MaybePromise;
  pop: () => MaybePromise;

  update: (dt: number) => void;
  draw: () => void;

  handlers: SceneManagerHandlers;
};

const default_scene_mode: SceneMode = {
  update: true,
  draw: true,
  handlers: true,
};

let scenes: Scene<any>[] = [];
const modes: SceneMode[] = [];
const initialized_scenes = new Set<Scene<any>["name"]>();

const debug_print_love_handlers = () => {
  let list: string = "";
  Object.keys(love.handlers).forEach((handler_name) => {
    list += `love.handlers.${handler_name}\n`;
  });
  console.log(list);
};

export const get_modes = () => [default_scene_mode, ...modes];
export const get_scenes = () => {
  return {
    drawn_scenes,
    updated_scenes,
    handler_scenes,
  };
};

let drawn_scenes: Scene<any>[] = [];
let updated_scenes: Scene<any>[] = [];
let handler_scenes: Scene<any>[] = [];

const recompute_scenes = () => {
  let last_drawn_index = modes.findIndex((t) => t.draw === false);
  let last_updated_index = modes.findIndex((t) => t.update === false);
  let last_handler_index = modes.findIndex((t) => t.handlers === false);

  // the "top" scene is always drawn, handled, and updated,
  // AND modes is always one less than scenes to accomodate
  const offset = 1;

  if (last_drawn_index === -1) {
    drawn_scenes = scenes.toReversed();
  } else {
    drawn_scenes = scenes.slice(0, last_drawn_index + offset).reverse();
  }

  if (last_updated_index === -1) {
    updated_scenes = scenes.toReversed();
  } else {
    updated_scenes = scenes.slice(0, last_updated_index + offset).reverse();
  }

  if (last_handler_index === -1) {
    handler_scenes = scenes.toReversed();
  } else {
    handler_scenes = scenes.slice(0, last_handler_index + offset).reverse();
  }

  console.log({
    last_drawn_index,
    last_updated_index,
    last_handler_index,
  });

  // drawn_scenes = scenes.slice(0, last_drawn_index).reverse();
  // updated_scenes = scenes.slice(0, last_updated_index).reverse();
  // handler_scenes = scenes.slice(0, last_handler_index).reverse();
  // console.log(modes);
  console.log("drawn_scenes", drawn_scenes.map((d, i) => `${i}: ${d.name}`).join(", "));
  console.log("updated_scenes", updated_scenes.map((d, i) => `${i}: ${d.name}`).join(", "));
  console.log("handler_scenes", handler_scenes.map((d, i) => `${i}: ${d.name}`).join(", "));
};

export const Scenes: SceneManager = {
  current: () => scenes.at(0) ?? undefined,

  get_scenes: () => scenes,

  create: <T>(scene_init: Scene<T>) => {
    const scene: Scene<T> = {
      ...scene_init,
    };

    return scene;
  },

  switch: async (scene) => {
    console.log("switching to ", scene.name);
    const previous = Scenes.current();
    if (previous?.exit != undefined) {
      console.log("Leaving Scene", previous.name);
      await previous.exit();
    }

    if (scenes.length > 0) {
      scenes.shift();
    }

    scenes.unshift(scene);

    recompute_scenes();

    if (scene.init !== undefined) {
      if (!initialized_scenes.has(scene.name)) {
        initialized_scenes.add(scene.name);
        await scene.init();
      }
    }

    if (scene.enter != undefined) {
      console.log("Entering Scene", scene.name);
      await scene.enter(previous);
    }

    return scene;
  },

  push: async (scene, mode) => {
    const current = Scenes.current();

    if (mode === undefined) {
      modes.unshift(default_scene_mode);
    } else {
      modes.unshift({ ...default_scene_mode, ...mode });
    }

    scenes.unshift(scene);

    recompute_scenes();

    if (scene.enter != undefined) {
      await scene.enter(current);
    }
  },

  pop: async () => {
    const current = Scenes.current();

    scenes.shift();
    modes.shift();

    recompute_scenes();

    if (current?.exit !== undefined) {
      await current.exit();
    }
  },

  update: (dt) => {
    updated_scenes.forEach((scene) => scene.update(dt));
  },

  draw: () => {
    drawn_scenes.forEach((scene) => scene.draw());
  },

  handlers: {
    keypressed: (key, scancode, isrepeat) => {
      handler_scenes.forEach((scene) => {
        if (scene.keypressed !== undefined) {
          scene.keypressed(key, scancode, isrepeat);
        }
      });
    },

    mousemoved: (x: number, y: number, dx: number, dy: number, istouch: boolean) => {
      handler_scenes.forEach((scene) => {
        if (scene.mousemoved) {
          scene.mousemoved(x, y, dx, dy, istouch);
        }
      });
    },

    conf: (config: Config) => {
      handler_scenes.forEach((scene) => {
        if (scene.conf) {
          scene.conf(config);
        }
      });
    },

    displayrotated: (displayIndex: number, newOrientation: DisplayOrientation) => {
      handler_scenes.forEach((scene) => {
        if (scene.displayrotated) {
          scene.displayrotated(displayIndex, newOrientation);
        }
      });
    },

    directorydropped: (fullDirectoryPath: string) => {
      handler_scenes.forEach((scene) => {
        if (scene.directorydropped) {
          scene.directorydropped(fullDirectoryPath);
        }
      });
    },

    // errorhandler: (msg: string) => {
    //   handler_scenes.forEach((scene) => {
    //     if (scene.errorhandler) {
    //       scene.errorhandler(msg);
    //     }
    //   });
    // },

    filedropped: (file: File) => {
      handler_scenes.forEach((scene) => {
        if (scene.filedropped) {
          scene.filedropped(file);
        }
      });
    },

    focus: (focus: boolean) => {
      handler_scenes.forEach((scene) => {
        if (scene.focus) {
          scene.focus(focus);
        }
      });
    },

    gamepadaxis: (joystick: Joystick, axis: GamepadAxis, value: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.gamepadaxis) {
          scene.gamepadaxis(joystick, axis, value);
        }
      });
    },

    gamepadpressed: (joystick: Joystick, button: GamepadButton) => {
      handler_scenes.forEach((scene) => {
        if (scene.gamepadpressed) {
          scene.gamepadpressed(joystick, button);
        }
      });
    },

    gamepadreleased: (joystick: Joystick, button: GamepadButton) => {
      handler_scenes.forEach((scene) => {
        if (scene.gamepadreleased) {
          scene.gamepadreleased(joystick, button);
        }
      });
    },

    joystickadded: (joystick: Joystick) => {
      handler_scenes.forEach((scene) => {
        if (scene.joystickadded) {
          scene.joystickadded(joystick);
        }
      });
    },

    joystickaxis: (joystick: Joystick, axis: number, value: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.joystickaxis) {
          scene.joystickaxis(joystick, axis, value);
        }
      });
    },

    joystickhat: (joystick: Joystick, hat: number, direction: JoystickHat) => {
      handler_scenes.forEach((scene) => {
        if (scene.joystickhat) {
          scene.joystickhat(joystick, hat, direction);
        }
      });
    },

    joystickpressed: (joystick: Joystick, button: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.joystickpressed) {
          scene.joystickpressed(joystick, button);
        }
      });
    },

    joystickreleased: (joystick: Joystick, button: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.joystickreleased) {
          scene.joystickreleased(joystick, button);
        }
      });
    },

    joystickremoved: (joystick: Joystick) => {
      handler_scenes.forEach((scene) => {
        if (scene.joystickremoved) {
          scene.joystickremoved(joystick);
        }
      });
    },

    keyreleased: (key: KeyConstant, scancode: Scancode) => {
      handler_scenes.forEach((scene) => {
        if (scene.keyreleased) {
          scene.keyreleased(key, scancode);
        }
      });
    },

    lowmemory: () => {
      handler_scenes.forEach((scene) => {
        if (scene.lowmemory) {
          scene.lowmemory();
        }
      });
    },

    mousefocus: (focus: boolean) => {
      handler_scenes.forEach((scene) => {
        if (scene.mousefocus) {
          scene.mousefocus(focus);
        }
      });
    },

    mousepressed: (x: number, y: number, button: number, isTouch: boolean, presses: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.mousepressed) {
          scene.mousepressed(x, y, button, isTouch, presses);
        }
      });
    },

    mousereleased: (x: number, y: number, button: number, isTouch: boolean, presses: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.mousereleased) {
          scene.mousereleased(x, y, button, isTouch, presses);
        }
      });
    },

    quit: (): boolean => {
      handler_scenes.forEach((scene) => {
        if (scene.quit) {
          return scene.quit();
        }
      });
      return false;
    },

    resize: (w: number, h: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.resize) {
          scene.resize(w, h);
        }
      });
    },

    textedited: (text: string, start: number, length: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.textedited) {
          scene.textedited(text, start, length);
        }
      });
    },

    textinput: (text: string) => {
      handler_scenes.forEach((scene) => {
        if (scene.textinput) {
          scene.textinput(text);
        }
      });
    },

    // threaderror: (thread: Thread, errorstr: string) => {
    //   handler_scenes.forEach((scene) => {
    //     if (scene.threaderror) {
    //       scene.threaderror(thread, errorstr);
    //     }
    //   });
    // },

    touchmoved: (id: LightUserData<"Touch">, x: number, y: number, dx: number, dy: number, pressure: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.touchmoved) {
          scene.touchmoved(id, x, y, dx, dy, pressure);
        }
      });
    },

    touchpressed: (id: LightUserData<"Touch">, x: number, y: number, dx: number, dy: number, pressure: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.touchpressed) {
          scene.touchpressed(id, x, y, dx, dy, pressure);
        }
      });
    },

    touchreleased: (id: LightUserData<"Touch">, x: number, y: number, dx: number, dy: number, pressure: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.touchreleased) {
          scene.touchreleased(id, x, y, dx, dy, pressure);
        }
      });
    },

    visible: (visible: boolean) => {
      handler_scenes.forEach((scene) => {
        if (scene.visible) {
          scene.visible(visible);
        }
      });
    },

    wheelmoved: (x: number, y: number) => {
      handler_scenes.forEach((scene) => {
        if (scene.wheelmoved) {
          scene.wheelmoved(x, y);
        }
      });
    },
  },
};

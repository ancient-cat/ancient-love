let current: Scene = {
  name: "Uninitialized Scene",
  update() {},
  draw() {},
};

type MaybePromise = Promise<void> | void;

namespace LoveParams {
  export type Keypressed = Parameters<NonNullable<typeof love.keypressed>>;
  export type Mousemoved = Parameters<NonNullable<typeof love.mousemoved>>;
}

export type Scene = Record<string, any> & {
  name: string;
  update: (dt: number) => void;
  draw: () => void;
  enter?: () => MaybePromise;
  exit?: () => MaybePromise;
  keypressed?: (...params: LoveParams.Keypressed) => MaybePromise;
  mousemoved?: (...params: LoveParams.Mousemoved) => MaybePromise;
};

export type SceneManager = {
  create: (scene_init: Scene) => Scene;
  switch: (scene: Scene) => Promise<Scene>;
  get: () => Scene;
  update: (dt: number) => void;
  draw: () => void;
  keypressed: (...params: LoveParams.Keypressed) => void;
  mousemoved: (...params: LoveParams.Mousemoved) => void;
};

export const Scenes: SceneManager = {
  create: (scene_init: Scene) => {
    const scene: Scene = {
      ...scene_init,
    };

    return scene;
  },

  switch: async (scene) => {
    if (current.exit != undefined) {
      await current.exit();
    }

    current = scene;

    if (current.enter != undefined) {
      await current.enter();
    }

    return scene;
  },

  update: (dt) => {
    current.update(dt);
  },

  draw: () => {
    current.draw();
  },

  get: () => {
    return current;
  },

  keypressed: (key, scancode, isrepeat) => {
    if (current.keypressed !== undefined) {
      current.keypressed(key, scancode, isrepeat);
    }
  },

  mousemoved: (x: number, y: number, dx: number, dy: number, istouch: boolean) => {
    if (current.mousemoved) {
      current.mousemoved(x, y, dx, dy, istouch);
    }
  },
};

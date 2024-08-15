let current: Scene = {
    name: "Uninitialized Scene",
    update() {},
    draw() {},
};

type MaybePromise = Promise<void> | void;

export type Scene = {
    name: string;
    update: (dt: number) => void;
    draw: () => void;
    enter?: () => MaybePromise;
    exit?: () => MaybePromise;
    keypress?: (key: string) => MaybePromise;
};

export type SceneInit = Partial<Scene> & {
    name: string;
    enter?: () => void;
    exit?: () => MaybePromise;
    update: (dt: number) => void;
    draw: () => void;
    keypress?: (key: string) => MaybePromise;
};

export type SceneManager = {
    create: (scene_init: SceneInit) => Scene;
    switch: (scene: Scene) => Promise<Scene>;
    get: () => Scene;
    update: (dt: number) => void;
    draw: () => void;
    keypress: (key: string) => void;
};

export const Scenes: SceneManager = {
    create: (scene_init: SceneInit) => {
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

    keypress: (key: string) => {
        if (current.keypress !== undefined) {
            current.keypress(key);
        }
    },
};

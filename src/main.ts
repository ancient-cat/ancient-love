import { Scenes } from "./core/scene";
import main_menu from "./scenes/main_menu";
import console_test from "./scenes/console_test";
import console from "./core/console";
import { GameTime } from "./core/systems/timer";
import { ECS } from "./core/ecs";

import { player } from "./core/entities";

love.load = async () => {
    console.log("Loading !");
    Scenes.switch(console_test);

    ECS.addComponent(player, {
        type: "position",
        x: 50,
        y: 50,
    });
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

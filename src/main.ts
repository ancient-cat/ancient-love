import { Scenes } from "./core/scene";
import main_menu from "./scenes/main_menu"
import console_test from "./scenes/console_test"
import console from "./core/console"
import { GameTime } from "./core/timer";


love.load = async () => {
    console.log("Loading !")
    Scenes.switch(console_test);
};

love.update = (dt: number) => {
    GameTime.update(dt);
    Scenes.update(dt);
}

love.keypressed = (key: string) => Scenes.keypress(key);

love.draw = () => {
    Scenes.draw();
};


love.conf = (config) => {
    config.console = true
}


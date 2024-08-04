import { test } from "./test"

love.load = () => {
    print(test)
    const [content] = love.filesystem.read("res/test.txt");
    print(content);
  };
  
love.draw = () => {
    love.graphics.print("Hello World!", 400, 300);
};


love.conf = (config) => {
    config.console = true
}


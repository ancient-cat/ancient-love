import { ColorType, randomHue } from "../color";
import console from "../console";
import { Scenes } from "../scene";
import { flux, Tween } from "flux";

export default Scenes.create(() => {
  const [mouse_x, mouse_y] = love.mouse.getPosition();
  love.mouse.setVisible(false);
  const mouse = {
    x: mouse_x,
    y: mouse_y,
  };

  const offset = {
    x: 20,
    y: -5,
  };

  let background_color: ColorType = new ColorType(randomHue(), 60, 40);

  return {
    name: "color_test",
    state: undefined,
    enter: () => {},

    mousemoved(x, y, dx, dy, istouch) {
      const [w, h] = love.graphics.getDimensions();
      const x_dim = x / w;
      const y_dim = y / h;
      background_color.h = x_dim * 360;
      background_color.s = y_dim * 100;
      mouse.x = x;
      mouse.y = y;
      if (x_dim > 0.8) {
        offset.x = -122;
      } else {
        offset.x = 10;
      }
    },
    update: (dt) => {},
    draw: () => {
      love.graphics.setBackgroundColor(...background_color.rgb);
      love.graphics.setColor(1, 1, 1);
      love.graphics.rectangle("line", mouse.x, mouse.y, 4, 4);
      love.graphics.setLineWidth(0.5);
      love.graphics.print(
        `hsl(${background_color.h.toFixed(0)}° ${background_color.s.toFixed(0)}% ${background_color.l.toFixed(0)}%)`,
        mouse.x + offset.x,
        mouse.y + offset.y
      );
    },
  };
});

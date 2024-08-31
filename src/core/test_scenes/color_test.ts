import { ColorType, randomHue } from "../color";
import console from "../console";
import { Scenes } from "../scene";
import { flux, Tween } from "flux";

export default Scenes.create(() => {
  const thing: {
    text: string;
    x: number;
    y: number;
  } = {
    text: "Hello World",
    x: 0,
    y: 0,
  };

  let background_color: ColorType = new ColorType(100, 60, 40);

  let tween: Tween;
  let color_tween: Tween;

  const retween = (w: number, h: number) => {
    const duration = math.random(1, 2);
    tween = flux.to(thing, duration, {
      x: math.random(0, w),
      y: math.random(0, h),
    });

    color_tween = flux.to(background_color, duration, {
      h: randomHue(),
    });

    tween.oncomplete(() => {
      retween(w, h);
    });
  };

  return {
    name: "color_test",
    state: undefined,
    enter: () => {
      const [w, h] = love.graphics.getDimensions();
      console.log("OY?");
      console.log(...background_color.rgb);

      // move thing offscreen initially so it tweens into view
      thing.x = (w / 2) * -1;
      thing.y = -100;
      retween(w, h);
    },
    update: (dt) => {},
    draw: () => {
      console.log(...background_color.rgb);
      love.graphics.setBackgroundColor(...background_color.hsl);
      love.graphics.setColor(1, 1, 1);
      love.graphics.print(thing.text, thing.x, thing.y);
    },
  };
});

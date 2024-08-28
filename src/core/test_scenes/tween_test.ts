import console from "../console";
import { Scenes } from "../scene";
import { flux, Tween } from "flux";

export default Scenes.create(() => {
  const thing: {
    text: string;
    x: number;
    y: number;
    color: { r: number; g: number; b: number };
  } = {
    text: "Hello World",
    x: 0,
    y: 0,
    color: {
      r: 1,
      g: 1,
      b: 1,
    },
  };

  let tween: Tween;
  let color_tween: Tween;

  const retween = (w: number, h: number) => {
    const duration = math.random(1, 2);
    tween = flux.to(thing, duration, {
      x: math.random(0, w),
      y: math.random(0, h),
    });

    color_tween = flux.to(thing.color, duration, {
      r: math.random(10, 100) / 100,
      g: math.random(10, 100) / 100,
      b: math.random(40, 100) / 100,
    });
    // color_tween = flux.to(thing.color, duration, )
    console.log("generated", thing.color);
    tween.oncomplete(() => {
      retween(w, h);
    });
  };

  return {
    name: "tween_test",
    state: undefined,
    enter: () => {
      const [w, h] = love.graphics.getDimensions();

      // move thing offscreen initially so it tweens into view
      thing.x = (w / 2) * -1;
      thing.y = -100;
      retween(w, h);
    },
    update: (dt) => {},
    draw: () => {
      love.graphics.setBackgroundColor(thing.color.r, thing.color.g, thing.color.b);
      love.graphics.setColor(1, 1, 1);
      love.graphics.print(thing.text, thing.x, thing.y);
    },
  };
});

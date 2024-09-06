import console from "../console";
import { Scenes } from "../scene";
import { create_ui } from "../ui/simple-ui";

export default Scenes.create(() => {
  const [right, bottom] = love.graphics.getDimensions();
  const UI = create_ui({
    left: 0,
    top: 0,
    bottom,
    right,
  });

  const button = UI.create_button({
    id: "test",
    text: "Hello World",
  });

  const button2 = UI.create_button({
    text: "button 2",
    limit: 10,
  });

  const label1 = UI.create_label({
    text: "Test Label",
    // position: {
    //   x: 100,
    //   y: 100,
    // },
  });

  button.on("click", () => {
    console.log("Button clicked!");
  });

  UI.add(button);
  UI.add(button2);
  UI.add(label1);
  UI.scale(1.25);

  return {
    name: "ui_test",
    state: undefined,

    update(dt) {
      UI.update(dt);
    },

    draw() {
      love.graphics.setBackgroundColor(0.2, 0.2, 0.2);

      UI.draw();
    },

    mousemoved(...args: Parameters<NonNullable<typeof love.mousemoved>>) {
      UI.mousemoved(...args);
    },

    mousepressed(...args: Parameters<NonNullable<typeof love.mousepressed>>) {
      UI.mousepressed(...args);
    },

    mousereleased(...args: Parameters<NonNullable<typeof love.mousereleased>>) {
      UI.mousereleased(...args);
    },
  };
});

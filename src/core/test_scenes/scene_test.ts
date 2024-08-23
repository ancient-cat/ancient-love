import { Canvas } from "love.graphics";
import { Scene, Scenes, get_modes } from "../scene";

type Grass = {
  x: number;
  y: number;
  height: number;
  x_sway: number;
  r: number;
  g: number;
  b: number;
  sway_direction: number;
};
const grass: Grass[] = [];
let canvas: Canvas;
// Declare the canvas variable

const x_sway_range = 4 as const;
const grass_particles = 30000 as const;
function calc_points() {
  const [w, h] = love.graphics.getDimensions();
  for (let i = 0; i < grass_particles; i++) {
    const x = love.math.random(0, w);
    const y = love.math.random(0, h);
    const height = math.random(4, 10);
    const x_sway = math.random(0, x_sway_range * 2);
    const r = math.random(4, 5) / 10;
    const g = math.random(50, 75) / 100;
    const b = math.random(4, 6) / 10;
    grass[i] = {
      x,
      y,
      height,
      x_sway,
      r,
      g,
      b,
      sway_direction: 1,
    };
  }
}

function draw_grass() {
  // love.graphics.setColor(0.3, 0.6, 0.4, 1);

  grass.forEach(({ x, y, height, x_sway, r, g, b }) => {
    // love.graphics.setColor(...color);
    love.graphics.line(x + (x_sway - x_sway_range), y, x, y + height);
  });
}

math.randomseed(os.time());

const scene_test = Scenes.create({
  name: "Scene Test",

  state: {
    sway_timer: 0.1,
    sway: false,
    player: {
      x: 100,
      y: 200,
      w: 6,
      h: 32,
    },
  },

  init: async () => {
    calc_points();
  },

  enter: () => {},

  keypressed: async (key: string) => {
    if (key === "return") {
      Scenes.push(game_menu, {
        draw: true,
        handlers: false,
        update: true,
      });
    }
    if (key === "p") {
      Scenes.push(pause, {
        draw: true,
        handlers: false,
        update: false,
      });
    }
  },

  mousepressed(x, y, button, isTouch, presses) {},

  update(dt) {
    if (Scenes.current()?.name === scene_test.name) {
      const change = { x: 0, y: 0 };
      const amount = 100 * dt;
      if (love.keyboard.isDown("left")) {
        change.x -= amount;
      } else if (love.keyboard.isDown("right")) {
        change.x += amount;
      }
      if (love.keyboard.isDown("down")) {
        change.y += amount;
      } else if (love.keyboard.isDown("up")) {
        change.y -= amount;
      }

      if (change.x !== 0 || change.y !== 0) {
        scene_test.state.player.x += change.x;
        scene_test.state.player.y += change.y;
      }
    }

    scene_test.state.sway_timer -= dt;

    if (scene_test.state.sway_timer <= 0) {
      scene_test.state.sway_timer = 0.1;
      scene_test.state.sway = !scene_test.state.sway;

      grass.forEach((grass) => {
        grass.x_sway += grass.sway_direction;
        if (Math.abs(grass.x_sway) >= x_sway_range) {
          grass.sway_direction *= -1;
        }
      });
      // create_bg();
    }
  },

  draw() {
    const { player } = scene_test.state;

    love.graphics.setBackgroundColor(0, 0.4, 0.2, 1);
    love.graphics.setColor(0.5, 0.6, 0.3, 1);
    draw_grass();

    const steps = 10;
    love.graphics.setColor(1, 0, 0.5, 0.15);
    love.graphics.rectangle("fill", player.x, player.y, player.w, player.h);
    for (let i = 0; i < steps; i++) {
      love.graphics.rectangle("fill", player.x, player.y, player.w, (player.h * (100 / steps)) / 100);
    }

    const h = love.graphics.getHeight();
    love.graphics.setColor(0, 0, 0, 0.25);
    love.graphics.rectangle("fill", 5, h - 225, 215, 210);

    love.graphics.setColor(1, 1, 1, 0.5);
    love.graphics.rectangle("line", 5, h - 225, 215, 210);
    love.graphics.line(5, h - 202, 220, h - 202);

    love.graphics.setColor(1, 1, 1);
    love.graphics.print("Scenes Test", 20, h - 300);
    love.graphics.print("Press ENTER to open menu", 20, h - 280);
    love.graphics.print("Press P to pause the game", 20, h - 260);
    love.graphics.print(`#\tdraw\thandlers\tupdate`, 20, h - 220);
    get_modes().forEach((mode, i) => {
      love.graphics.print(`${i}\t${mode.draw}\t${mode.handlers}\t${mode.update}`, 20, h - 200 + 10 * i);
    });
    Scenes.get_scenes().forEach((scene, i) => {
      love.graphics.print(`${i}\t${scene.name}\t`, 20, h - 120 + 10 * i);
    });
  },
});

const game_menu = Scenes.create({
  name: "game_menu",
  state: {
    container: [0, 0, 0, 0] as readonly [number, number, number, number],
    cursor: 0,
    options: ["Party", "Inventory", "Status", "Abilities", "Settings", "Close"],
  },
  update: () => {},
  enter: () => {
    const size = 300;
    const [w, h] = love.graphics.getDimensions();
    game_menu.state.container = [w - size, 0, size, h];
  },
  keypressed: (key) => {
    if (key === "up") {
      game_menu.state.cursor -= 1;
    } else if (key === "down") {
      game_menu.state.cursor += 1;
    } else if (key === "p") {
      Scenes.push(pause, {
        draw: true,
        handlers: false,
        update: false,
      });
    } else {
      Scenes.pop();
    }

    if (game_menu.state.cursor > game_menu.state.options.length - 1) {
      game_menu.state.cursor = 0;
    } else if (game_menu.state.cursor < 0) {
      game_menu.state.cursor = game_menu.state.options.length - 1;
    }
  },
  draw: () => {
    const { options, cursor, container } = game_menu.state;
    love.graphics.setColor(0.1, 0.2, 0.1);
    love.graphics.rectangle("fill", ...container);
    love.graphics.setColor(1, 1, 1);
    options.forEach((item, i) => {
      const icon = cursor === i ? ">" : "|";
      const line_start = 15 * i;
      love.graphics.print(`${icon} ${item}`, container[0] + 10, 40 + line_start);
    });
  },
});

const pause = Scenes.create({
  name: "pause",
  state: undefined,
  update: () => {},
  keypressed: (key) => {
    if (key === "p") {
      Scenes.pop();
    }
  },
  draw: () => {
    const [w, h] = love.graphics.getDimensions();
    love.graphics.setColor(0, 0, 0, 0.4);
    love.graphics.rectangle("fill", 0, 0, w, h);
    love.graphics.setColor(1, 1, 1, 1);
    love.graphics.print("— Game is Paused —", (w - 50) / 2, (h + 20) / 2);
    love.graphics.print("Press p to return to game", (w + 30) / 2, h + 20 / 2 + 20);
  },
});

export default scene_test;

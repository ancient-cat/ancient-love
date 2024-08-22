import console from "../console";

import { Scenes } from "../scene";
import { createCollisionSystem } from "../systems/collisions";
import { ECS } from "../../ecs";
import { CollisionGroup, CollisionNotifier } from "../../ecs/components/collider";

const player = ECS.create();
const enemy = ECS.create();

ECS.addComponent(player, {
  type: "collider",
  group: CollisionGroup.Player,
  x: 100,
  y: 100,
  w: 100,
  h: 100,
  interactsWith: CollisionGroup.Enemy,
  notify: CollisionNotifier.Enter | CollisionNotifier.Exit,
});

ECS.addComponent(enemy, {
  type: "collider",
  group: CollisionGroup.Enemy,
  x: 200,
  y: 350,
  w: 100,
  h: 100,
  interactsWith: CollisionGroup.All,
  notify: CollisionNotifier.Enter | CollisionNotifier.Exit,
});

const player_with_components = ECS.tap<"collider">(player);
const enemy_with_components = ECS.tap<"collider">(enemy);

const collision_system = createCollisionSystem();

const collisions_test = Scenes.create({
  name: "collisions_test",
  state: undefined,
  enter: () => {},
  draw: () => {
    love.graphics.setColor(0.8, 0.1, 0.1);
    love.graphics.rectangle("line", player_with_components.collider.x, player_with_components.collider.y, player_with_components.collider.w, player_with_components.collider.h);

    love.graphics.setColor(0.2, 0.2, 0.5);
    love.graphics.rectangle("line", enemy_with_components.collider.x, enemy_with_components.collider.y, enemy_with_components.collider.w, enemy_with_components.collider.h);
  },
  keypressed: (key: string) => {
    console.log(key);
    if (key === "up") {
    }
  },
  update: (dt) => {
    const pressed_keys = {
      up: love.keyboard.isDown("up"),
      down: love.keyboard.isDown("down"),
      left: love.keyboard.isDown("left"),
      right: love.keyboard.isDown("right"),
    } as const;

    let x_velocity: number = 0;
    let y_velocity: number = 0;

    if (pressed_keys.down) {
      y_velocity = 1;
    } else if (pressed_keys.up) {
      y_velocity = -1;
    }

    if (pressed_keys.right) {
      x_velocity = 1;
    } else if (pressed_keys.left) {
      x_velocity = -1;
    }

    if (x_velocity !== 0 || y_velocity !== 0) {
      collision_system.move(dt, player_with_components.entity, x_velocity * 50, y_velocity * 50);
    }
  },
});

export default collisions_test;

import console from "../console";

import { Scenes } from "../scene";
import { createCollisionSystem } from "../systems/collisions";
import { ECS } from "../../ecs";
import { CollisionGroup, CollisionNotifier } from "../../ecs/components/collider";
import { mouse } from "love";

const collisions_test = Scenes.create(() => {
  const player = ECS.create();
  const block1 = ECS.create();
  const block2 = ECS.create();
  const block3 = ECS.create();

  ECS.addComponent(player, {
    type: "collider",
    group: CollisionGroup.Player,
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    interactsWith: CollisionGroup.Enemy,
    notify: CollisionNotifier.Enter | CollisionNotifier.Exit,
    resolution: "none",
  });

  ECS.addComponent(block1, {
    type: "collider",
    group: CollisionGroup.Enemy,
    x: 200,
    y: 350,
    w: 100,
    h: 100,
    interactsWith: CollisionGroup.Player,
    notify: CollisionNotifier.Touch,
    resolution: "bounce",
  });

  ECS.addComponent(block2, {
    type: "collider",
    group: CollisionGroup.Enemy,
    x: 300,
    y: 200,
    w: 60,
    h: 60,
    interactsWith: CollisionGroup.Player,
    notify: CollisionNotifier.All,
    resolution: "static",
  });

  ECS.addComponent(block3, {
    type: "collider",
    group: CollisionGroup.Enemy,
    x: 200,
    y: 100,
    w: 60,
    h: 60,
    interactsWith: CollisionGroup.Player,
    notify: CollisionNotifier.Enter | CollisionNotifier.Exit,
    resolution: "none",
  });

  const active_collisions = new Map<Entity, boolean>();

  const player_with_components = ECS.tap<"collider">(player);
  const drawn_blocks: QueriedComponentRecord<"collider">[] = [
    ECS.tap<"collider">(block1),
    ECS.tap<"collider">(block2),
    ECS.tap<"collider">(block3),
  ];

  const collision_system = createCollisionSystem();

  return {
    name: "collisions_test",
    state: undefined,
    enter: () => {
      collision_system.on("collision", ({ record, collisions }) => {
        active_collisions.set(record.entity, true);
        collisions.forEach((col) => {
          active_collisions.set(col.entity, true);
        });
      });

      collision_system.on("enter", ({ record, collider }) => {
        if (record.entity === player) {
          console.log(
            "player entered",
            collider.collider.x,
            collider.collider.y,
            collider.collider.w,
            collider.collider.h
          );
        }
      });
    },
    draw: () => {
      love.graphics.setBackgroundColor(0.1, 0.1, 0.2);

      love.graphics.setColor(0.8, 0.1, 0.1);
      love.graphics.rectangle(
        active_collisions.has(player) ? "fill" : "line",
        player_with_components.collider.x,
        player_with_components.collider.y,
        player_with_components.collider.w,
        player_with_components.collider.h
      );

      drawn_blocks.forEach((block, i) => {
        love.graphics.setColor(0.2 * i, 0.6, 0.8);
        love.graphics.rectangle(
          active_collisions.has(block.entity) ? "fill" : "line",
          block.collider.x,
          block.collider.y,
          block.collider.w,
          block.collider.h
        );
      });
    },
    keypressed: (key: string) => {
      if (key === "up") {
      }
    },
    update: (dt) => {
      active_collisions.clear();
      const pressed_keys = {
        up: love.keyboard.isDown("up"),
        down: love.keyboard.isDown("down"),
        left: love.keyboard.isDown("left"),
        right: love.keyboard.isDown("right"),
      } as const;

      const px_per_second = 200;

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
        collision_system.move(
          dt,
          player_with_components.entity,
          x_velocity * px_per_second,
          y_velocity * px_per_second
        );
      }
    },
  };
});

export default collisions_test;

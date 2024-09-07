import { ECS } from "../../ecs";
import { ColliderComponent, ColliderResolution, CollisionNotifier } from "../../ecs/components";
import { Box, box_intersection } from "../aabb";
import { assertion } from "../assert";
import * as bit from "../bit";
import console from "../console";
import { create_event_dispatcher, EventDispatcher } from "../dispatcher";
import { GameTime } from "./gametime";

const throttled_log = GameTime.create_throttle(1, (target: Box, colliders: QueriedComponentRecord<"collider">[]) => {
  console.log("attempted to move to ", target);
  console.log(colliders);
});

type CollisionEventMap = {
  collision: [record: QueriedComponentRecord<"collider">, colliders: QueriedComponentRecord<"collider">[]];
  touch: [record: QueriedComponentRecord<"collider">, colliders: QueriedComponentRecord<"collider">[]];
  collided: [record: QueriedComponentRecord<"collider">, colliders: QueriedComponentRecord<"collider">[]];
  enter: [record: QueriedComponentRecord<"collider">, colliders: QueriedComponentRecord<"collider">[]];
  exit: [record: QueriedComponentRecord<"collider">, colliders: QueriedComponentRecord<"collider">[]];
};

export type CollisionSystem = EventDispatcher<CollisionEventMap> & {
  update: (entity: Entity, x: number, y: number) => void;
  check: (
    component: QueriedComponentRecord<"collider">,
    target_x: number,
    target_y: number
  ) => QueriedComponentRecord<"collider">[];
  move: (dt: number, entity: Entity, x: number, y: number) => QueriedComponentRecord<"collider">[];
};

export const createCollisionSystem = (): CollisionSystem => {
  const events: EventDispatcher<CollisionEventMap> = create_event_dispatcher<CollisionEventMap>();

  const active: Map<Entity, Entity[]> = new Map<Entity, Entity[]>();

  /**
   * Used for sorting collisions by the listed order
   */
  const collision_order: Record<ColliderResolution, number> = {
    custom: 0,
    none: 0,
    bounce: 1,
    slide: 2,
    absorb: 3,
    soft: 4,
    static: 5,
    stick: 6,
  };

  const system: CollisionSystem = {
    ...events,

    update: (entity: Entity, x: number, y: number) => {
      const record = ECS.tap<"collider">(entity);
      record.collider.x = x;
      record.collider.y = y;
    },

    move: (dt: number, entity: Entity, x: number, y: number) => {
      const record = ECS.tap<"collider">(entity);

      const target_x = x * dt;
      const target_y = y * dt;
      const collisions = system.check(record, target_x, target_y);

      if (collisions.length > 0) {
        // TODO: decide how responses are implemented
        // slide, area, etc
        // console.log(`${collisions.length} Collisions`);

        collisions.sort((a, b) => {
          return collision_order[a.collider.resolution] - collision_order[b.collider.resolution];
        });

        if (record.collider.notify !== CollisionNotifier.None) {
          let items = active.get(record.entity) ?? [];
          let has_changed: boolean = false;

          // Handle exiting collisions (things that were previously collisions and now aren't)
          const exiting = items.filter((item) => collisions.find((col) => col.entity === item) === undefined);
          if (exiting.length > 0) {
            items = items.filter((item) => !exiting.includes(item));
            has_changed = true;
            exiting.forEach((entity) => {
              const collider = ECS.tap<"collider">(entity);
              events.emit("exit", record, collider);
            });
          }

          for (let collision of collisions) {
            const previously_collided = items.includes(collision.entity);

            if (
              record.collider.notify === CollisionNotifier.All ||
              bit.has(record.collider.notify, CollisionNotifier.Continious)
            ) {
              if (previously_collided) {
                events.emit("collided", record, collision);
              }
            } else if (!previously_collided && bit.has(record.collider.notify, CollisionNotifier.Touch)) {
              items.push(collision.entity);
              has_changed = true;
              events.emit("touch", record, collision);
            } else if (!previously_collided && bit.has(record.collider.notify, CollisionNotifier.Enter)) {
              items.push(collision.entity);
              has_changed = true;
              events.emit("enter", record, collision);
            }
          }

          if (has_changed) {
            active.set(record.entity, items);
          }
        }

        const non_collisions = collisions.filter((a) => a.collider.resolution === "none");

        // CASE: if we've only collided with non-altering collisions, then short-circuit
        //       and continue moving
        if (non_collisions.length === collisions.length) {
          record.collider.x += target_x;
          record.collider.y += target_y;
          events.emit("collision", record, collisions);
        } else {
          let handled: boolean = false;

          for (let collision of collisions) {
            const { collider } = collision;
            if (collider.resolution === "custom") {
              if (collider.custom_resolution !== undefined) {
                handled = collider.custom_resolution(record, collision);
              }
            } else if (collider.resolution === "bounce") {
              // TODO: determine bounce angle
              // TODO: set way to determine bounce amount
              record.collider.x += target_x * -10;
              record.collider.y += target_y * -10;
              handled = true;
              break;
            } else if (collider.resolution === "static") {
              // dont continue moving
              handled = true;
              // if (target_x > 0) {
              //   record.collider.x = collider.x - 1;
              // } else if (target_x < 0) {
              //   record.collider.x = collider.x + 1;
              // }

              // if (target_y > 0) {
              //   record.collider.y = collider.y - 1;
              // } else if (target_y < 0) {
              //   record.collider.y = collider.y + 1;
              // }
              // handled = true;
              break;
            } else if (collider.resolution === "slide") {
              // TODO
            } else if (collider.resolution === "absorb") {
              // TODO
            } else if (collider.resolution === "soft") {
              // TODO
            } else if (collider.resolution === "stick") {
            } else if (collider.resolution === "none") {
              // do nothing, yet
            } else {
              const _exhausted: never = collider.resolution;
            }
          }

          if (!handled && non_collisions.length > 0) {
            record.collider.x += target_x;
            record.collider.y += target_y;
          }

          if (handled) {
            handled = true;
            events.emit("collision", record, collisions);
          }

          // collisions.forEach((collider) => {
          //   handle_notify(record, collider);
          // });

          // let others = active.get(record.entity) ?? [];
          // if (record.collider.notify === CollisionNotifier.All) {

          // }
          // else {
          //   record.collider.notify === CollisionNotifier.Continious;
          // }

          // record.collider.x += target_x;
          // record.collider.y += target_y;

          // console.log("Collisions", collisions.at(0)?.collider.x +);
        }
      } else {
        record.collider.x += target_x;
        record.collider.y += target_y;
      }

      return collisions;
    },

    check: (component: QueriedComponentRecord<"collider">, moved_x: number, moved_y: number) => {
      const { collider: moved_collider } = component;
      const colliders = ECS.query("collider");

      // optimization oppurtunity: spatial partitioning
      return colliders.filter((collider) => {
        // don't include the current entity
        if (collider.entity === component.entity) {
          return false;
        }

        if (bit.has(moved_collider.interactsWith, collider.collider.group)) {
          const box: Box = {
            x: moved_collider.x + moved_x,
            y: moved_collider.y + moved_y,
            w: moved_collider.w,
            h: moved_collider.h,
          };

          const is_overlapping = box_intersection(box, collider.collider);
          if (is_overlapping) {
            return true;
          }
        }

        return false;
      });
    },
  };

  return system;
};

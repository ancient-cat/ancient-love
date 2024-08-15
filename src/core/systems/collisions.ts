import { Box, box_intersection } from "../aabb";
import { assertion } from "../assert";
import * as bit from "../bit";
import console from "../console";
import { ComponentRecord, ECS, Entity, QueriedComponentRecord } from "../ecs";
import { type Signal, createSignal } from "../signal";

export type CollisionSystem<EventMap extends Record<string, any> = any> = {
    events: Signal<EventMap>;
    update: (entity: Entity, x: number, y: number) => void;
    check: (
        component: QueriedComponentRecord<"collider">,
        target_x: number,
        target_y: number
    ) => QueriedComponentRecord<"collider">[];
    move: (
        dt: number,
        entity: Entity,
        x: number,
        y: number
    ) => QueriedComponentRecord<"collider">[];
};

export const createCollisionSystem = <
    EventMap extends Record<string, any>,
>(): CollisionSystem<EventMap> => {
    const events: Signal<EventMap> = createSignal<EventMap>();

    const system: CollisionSystem<EventMap> = {
        events,

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
                console.log("Collisions", collisions);
            } else {
                record.collider.x += target_x;
                record.collider.y += target_y;
            }

            return collisions;
        },

        check: (
            component: QueriedComponentRecord<"collider">,
            target_x: number,
            target_y: number
        ) => {
            const { collider: moved_collider } = component;
            assertion(moved_collider !== undefined);

            const colliders = ECS.query("collider");

            // optimization oppurtunity: spatial partitioning
            return colliders.filter((collider) => {
                // don't include the current entity
                if (collider.entity === component.entity) {
                    return false;
                }

                if (
                    bit.has(
                        moved_collider.interactsWith,
                        collider.collider.group
                    )
                ) {
                    // tunnel algorithm where we check the entire path for a collision
                    const box: Box = {
                        x: moved_collider.x,
                        y: moved_collider.y,
                        w: target_x + moved_collider.w,
                        h: target_y + moved_collider.h,
                    };

                    const is_overlapping = box_intersection(
                        box,
                        collider.collider
                    );
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

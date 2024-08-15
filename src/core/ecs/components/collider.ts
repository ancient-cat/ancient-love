import type { Box } from "../../aabb";

// unused rn
enum ColliderType {
    AABB = 0,
    // only support AABB rn
    // Circle = 1,
    // Add more types as needed
}

export enum CollisionGroup {
    None = 0,
    // example may be Player = 1 << 0,
    Player = 1 << 0,
    Enemy = 1 << 1,
    All = (1 << 4) - 1, // needs to be the number of items (including All) - 1
}

export enum CollisionNotifier {
    None = 0,
    Touch = 1 << 0,
    Continious = 1 << 1,
    Enter = 1 << 2,
    Exit = 1 << 3,
    All = (1 << 6) - 1, // needs to be the number of items (including All) - 1
}

export type ColliderComponent = Box & {
    /**
     *
     */
    type: "collider";

    /**
     * This Entity's group
     */
    group: CollisionGroup;
    /**
     * The entity groups that this Entity can collide with
     */
    interactsWith: CollisionGroup;

    /**
     * The type of notification for a collision
     */
    notify: CollisionNotifier;
};

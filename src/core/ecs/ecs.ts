// The core types of the ECS are below

import {
    PositionComponent,
    VelocityComponent,
    DrawComponent,
    GameTimeComponent,
    ShootComponent,
    ColliderComponent,
} from "./components";

export type Entity = unknown;

export type ComponentType =
    | PositionComponent
    | VelocityComponent
    | DrawComponent
    | GameTimeComponent
    | ShootComponent
    | ColliderComponent;

// use an interface -- it handles overlaps in the way we want
export type ComponentRecord = {
    entity: Entity;
    position?: PositionComponent;
    velocity?: VelocityComponent;
    draw?: DrawComponent;
    gametime?: GameTimeComponent;
    shoot?: ShootComponent;
    collider?: ColliderComponent;
};

export type Component = keyof ComponentRecord;
type Identity = {
    entity: Entity;
};

export type QueriedComponentRecord<
    TComponentKeys extends keyof ComponentRecord,
> = Required<Pick<ComponentRecord, TComponentKeys>> & Identity;

/**
 * Handles functionality for managing Entities, and their features
 */
export type EntityComponentManager = {
    /**
     * Creates a new Entity and registers it.
     */
    create: () => Entity;

    /**
     * Unregisters an entity and it's components
     */
    delete: (entity: Entity) => void;

    /**
     * Unregisters all entity and components
     */
    clear: () => void;

    /**
     * Adds a component to an entity
     */
    addComponent: (entity: Entity, component: ComponentType) => void;

    /**
     * Removes a component from an entity
     */
    removeComponent: (entity: Entity, component: Component) => void;

    /**
     * Finds Entities that have the parameter Component types
     */
    query: <T extends Component>(
        ...components: T[]
    ) => QueriedComponentRecord<T>[];

    /**
     * Retrieve the Components assocaited to an Entity
     */
    get: (entity: Entity) => ComponentRecord;
    /**
     * Similar to "get", but asserts the entity has specific components
     */
    tap: <AssertedKeys extends keyof ComponentRecord>(
        entity: Entity
    ) => QueriedComponentRecord<AssertedKeys>;
};

const map = new Map<Entity, ComponentRecord>();
let id = 0;

export const ECS: EntityComponentManager = {
    create: function (): Entity {
        const entity: Entity = ++id;
        map.set(entity, {
            entity,
            draw: undefined,
            gametime: undefined,
            position: undefined,
            shoot: undefined,
            velocity: undefined,
            collider: undefined,
        });
        return entity;
    },

    delete: function (entity: Entity): void {
        assert(map.has(entity), "Attempting to delete non-existant entity");
        map.delete(entity);
    },

    clear: function (): void {
        map.clear();
    },

    addComponent: function (entity: Entity, component: ComponentType): void {
        const record: ComponentRecord = assert(map.get(entity));

        // cant do this seemingly. RIP
        // record[component.type] = component;
        if (component.type === "position") {
            record.position = component;
        } else if (component.type === "velocity") {
            record.velocity = component;
        } else if (component.type === "draw") {
            record.draw = component;
        } else if (component.type === "gametime") {
            record.gametime = component;
        } else if (component.type === "shoot") {
            record.shoot = component;
        } else if (component.type === "collider") {
            record.collider = component;
        } else {
            const _exhausted: never = component;
        }
    },
    removeComponent: function (
        entity: Entity,
        ...components: Component[]
    ): void {
        const record = ECS.get(entity);
        components.forEach((component) => {
            record[component] = undefined;
        });
    },

    query: <T extends keyof ComponentRecord>(
        ...components: T[]
    ): QueriedComponentRecord<T>[] => {
        return Array.from(map.values()).filter(
            (item): item is QueriedComponentRecord<T> => {
                return components.every(
                    (component) => item[component] !== undefined
                );
            }
        );
    },
    get: (entity: Entity) => {
        const result: ComponentRecord = assert(map.get(entity));
        return result;
    },

    tap: <AssertedKeys extends keyof ComponentRecord>(entity: Entity) => {
        const result = map.get(entity) as QueriedComponentRecord<AssertedKeys>;
        return result;
    },
};

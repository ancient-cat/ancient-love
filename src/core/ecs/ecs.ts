
import type { Component, ComponentRecord, ComponentType, Entity, QueriedComponentRecord, } from "./components"

/**
 * Handles functionality for managing Entities, and their features
 */
type EntityComponentManager = {

    /**
     * Creates a new Entity and registers it.
     */
    create: () => Entity;

    /**
     * Adds a component to an entity
     */
    addComponent: (entity: Entity, component: ComponentType) => void;

    /**
     * Removes a component from an entity
     */
    removeComponent: (entity: Entity, component: ComponentType) => void;

    /**
     * Finds Entities that have the parameter Component types
     */
    query: <T extends Component>(...components: T[]) => QueriedComponentRecord<T>[];

    /**
     * Retrieve the Components assocaited to an Entity
     */
    get: (entity: Entity) => ComponentRecord;
}

const map = new Map<Entity, ComponentRecord>()
let id = 0

export const ECS: EntityComponentManager = {
    create: function (): Entity {
        const entity: Entity = ++id;
        map.set(entity, {})
        return entity;
    },
    
    addComponent: function (entity: Entity, component: ComponentType): void {
        const record: ComponentRecord = assert(map.get(entity));

        // cant do this seemingly. RIP
        // record[component.type] = component;

        if (component.type === "position") {
            record.position = component;
        }
        else if (component.type === "velocity") {
            record.velocity = component;
        }
        else {
            const _exhausted: never = component;
        }

    
    },
    removeComponent: function (entity: Entity, component: ComponentType): void {
        throw new Error("Function not implemented.");
    },
    query: <T extends keyof ComponentRecord>(...components: T[]): QueriedComponentRecord<T>[] => {
        return Array.from(map.values())
            .filter((item): item is QueriedComponentRecord<T> => {
                return components.every((component) => item[component] !== undefined);
            });
    },
    get: (entity: Entity) => {
      const result: ComponentRecord = assert(map.get(entity));
      return result;
    }
}


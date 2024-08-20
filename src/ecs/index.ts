import { entity_component_system } from "../core/ecs";

/**
 * This component map is the key to the ECS
 */

declare global {
  export type ComponentDefinition<T> = T extends { type: keyof ComponentMap } ? T : never;
  export type Entity = unknown;

  export type ComponentType = ComponentMap[keyof ComponentMap];

  export type ComponentRecord = Identity & Partial<ComponentMap>;

  export type QueriedComponentRecord<TComponentKeys extends keyof ComponentRecord> = Required<
    Pick<ComponentRecord, TComponentKeys>
  > &
    Identity;

  export type Component = keyof ComponentRecord;
  export type Identity = {
    entity: Entity;
  };
}

export const ECS = entity_component_system();

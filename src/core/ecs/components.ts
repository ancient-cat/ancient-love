// The core types of the ECS are below

export type Entity = unknown;

export type PositionComponent = {
  type: "position";
  x: number;
  y: number;
};

export type VelocityComponent = {
  type: "velocity";
  dx: number;
  dy: number;
};

export type ComponentType = PositionComponent | VelocityComponent;

// use an interface -- it handles overlaps in the way we want
export type ComponentRecord = {
  position?: PositionComponent;
  velocity?: VelocityComponent;
};

export type Component = keyof ComponentRecord;

export type QueriedComponentRecord<TComponentKeys extends keyof ComponentRecord> = Required<Pick<ComponentRecord, TComponentKeys>>;

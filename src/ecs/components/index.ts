import { Milliseconds, Seconds } from "../../core/types";
import { ColliderComponent } from "./collider";

export * from "./collider";

export type GameTimeComponent = ComponentDefinition<{
  type: "gametime";
  update: (elapsedTime: Seconds, dt: Milliseconds) => void;
}>;

export type PositionComponent = ComponentDefinition<{
  type: "position";
  x: number;
  y: number;
}>;

export type VelocityComponent = ComponentDefinition<{
  type: "velocity";
  dx: number;
  dy: number;
}>;

export type ShootComponent = ComponentDefinition<{
  type: "shoot";
  shoot: () => void;
}>;

export type DrawComponent = ComponentDefinition<{
  type: "draw";
  draw: () => void;
}>;

declare global {
  export type ComponentMap = {
    position: PositionComponent;
    velocity: VelocityComponent;
    draw: DrawComponent;
    gametime: GameTimeComponent;
    shoot: ShootComponent;
    collider: ColliderComponent;
  };
}

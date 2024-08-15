import { Milliseconds, Seconds } from "../../types";

export * from "./collider";

export type GameTimeComponent = {
    type: "gametime";
    update: (elapsedTime: Seconds, dt: Milliseconds) => void;
};

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

export type ShootComponent = {
    type: "shoot";
    shoot: () => void;
};

export type DrawComponent = {
    type: "draw";
    draw: () => void;
};

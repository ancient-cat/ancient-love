import { create_event_dispatcher } from "./core/dispatcher";
import { create_signal } from "./core/signal";
import { ECS } from "./ecs";

export type GameEvents = {
  start: undefined;
  quit: undefined;
};

export const game_events = create_event_dispatcher<GameEvents>();

export const player = ECS.create();

export type Player = {
  entity: Entity;
};

export type LevelState = {};

import type { LurkerModule } from "./lurker/lurker";
import type { LumeModule } from "./lurker/lume";
import type { JsonModule } from "./json/json";
import * as Flux from "./flux/flux";

/** @noSelf **/
declare module "packages" {
  export const lume: LumeModule;
  export const lurker: LurkerModule;
  export const json: JsonModule;
  export const flux: Flux.Flux;

  export type Easing = Flux.Easing;
  export type EasingFunction = Flux.EasingFunction;
  export type Tween = Flux.Tween;
}

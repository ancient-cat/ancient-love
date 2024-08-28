import * as F from "./flux";

declare module "flux" {
  export const flux: F.Flux;
  export type Easing = F.Easing;
  export type EasingFunction = F.EasingFunction;
  export type Flux = F.Flux;
  export type Tween = F.Tween;
}

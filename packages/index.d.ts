import type { LurkerModule } from "./lurker/lurker";
import type { LumeModule } from "./lurker/lume";
import type { JsonModule } from "./json/json";

/** @noSelf **/
declare module "packages" {
  export const lume: LumeModule;
  export const lurker: LurkerModule;
  export const json: JsonModule;
}
